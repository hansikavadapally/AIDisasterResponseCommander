import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile, type Role } from '@/lib/supabase';
import { ensureCommanderAccount, ensureProfile, seedOperationalData, isDatabaseSeeded } from '@/lib/seed';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  signInAsCommander: (commanderId: string, password: string) => Promise<{ error: string | null }>;
  signInAsClient: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpAsClient: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUpAsCommander: (
    commanderId: string,
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // One-time bootstrap: ensure the commander auth account exists.
  // Operational data seeding happens after the commander logs in (needs auth).
  useEffect(() => {
    (async () => {
      try {
        await ensureCommanderAccount();
      } catch (e) {
        console.error('Bootstrap error', e);
      }
    })();
  }, []);

  // Session + profile subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('loadProfile error', error);
    }

    // If no profile exists but the user is the commander, create it.
    // This handles the case where ensureCommanderAccount created the auth user
    // but the profile insert failed (e.g., due to RLS timing).
    if (!data && userId) {
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData.user?.user_metadata;
      if (meta?.role === 'commander') {
        await ensureProfile(userId, 'commander', meta.display_name ?? 'Sarah Johnson', 'commander@roboweb.ai', null, meta.commander_id ?? 'CMD001');
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        setProfile(retry as Profile | null);
      } else if (meta?.role === 'client') {
        await ensureProfile(userId, 'client', meta.display_name ?? 'Client', userData.user?.email ?? '', meta.phone ?? null);
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        setProfile(retry as Profile | null);
      } else {
        setProfile(null);
      }
    } else {
      setProfile(data as Profile | null);
    }
    setLoading(false);
  }

  async function signInAsCommander(commanderId: string, password: string) {
    const id = commanderId.trim().toUpperCase();
    if (!id) {
      return { error: 'Please enter your Commander ID.' };
    }
    // Look up the commander's email by their Commander ID.
    // Predefined CMD001 falls back to the seeded account email.
    let email = 'commander@roboweb.ai';
    if (id !== 'CMD001') {
      const { data: profile, error: lookupErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'commander')
        .ilike('commander_id', id)
        .maybeSingle();
      if (lookupErr || !profile) {
        return { error: `No commander found with ID ${id}. Check your ID or register first.` };
      }
      email = profile.email;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const meta = data.user.user_metadata;
      await ensureProfile(
        data.user.id,
        'commander',
        meta?.display_name ?? 'Sarah Johnson',
        email,
        null,
      );
      if (!(await isDatabaseSeeded())) {
        await seedOperationalData();
      }
      await loadProfile(data.user.id);
    }
    return { error: null };
  }

  async function signInAsClient(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await loadProfile(data.user.id);
    }
    return { error: null };
  }

  async function signUpAsCommander(
    commanderId: string,
    fullName: string,
    email: string,
    password: string,
  ) {
    const id = commanderId.trim().toUpperCase();
    if (!id) return { error: 'Commander ID is required.' };
    if (id === 'CMD001') {
      return { error: 'CMD001 is reserved. Choose a different Commander ID.' };
    }
    // Check whether the Commander ID is already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'commander')
      .ilike('commander_id', id)
      .maybeSingle();
    if (existing) {
      return { error: `Commander ID ${id} is already registered. Choose another.` };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'commander', display_name: fullName, commander_id: id },
      },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        role: 'commander',
        display_name: fullName,
        email,
        commander_id: id,
      });
      // Seed operational data if this is the first commander
      if (!(await isDatabaseSeeded())) {
        await seedOperationalData();
      }
      await loadProfile(data.user.id);
    }
    return { error: null };
  }

  async function signUpAsClient(
    fullName: string,
    email: string,
    phone: string,
    password: string,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client', display_name: fullName, phone },
      },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        role: 'client',
        display_name: fullName,
        email,
        phone,
      });
      if (profileError) {
        console.error('Profile insert error', profileError);
      }
      await loadProfile(data.user.id);
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  }

  const value: AuthContextType = {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signInAsCommander,
    signInAsClient,
    signUpAsClient,
    signUpAsCommander,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
