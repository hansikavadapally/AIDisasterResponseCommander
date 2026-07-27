import { supabase } from '@/lib/supabase';
import { generateRobots, generateDrones, generateAlerts, generateResources, generateActivityLogs } from '@/lib/mockData';

// Checks whether the database has been seeded with operational data.
export async function isDatabaseSeeded(): Promise<boolean> {
  const { count, error } = await supabase
    .from('robots')
    .select('*', { count: 'exact', head: true });
  if (error) return false;
  return (count ?? 0) > 0;
}

// Seeds operational data (robots, drones, alerts, resources, activity logs).
// Must be called with an authenticated session (commander). Safe to call
// multiple times - only inserts if tables are empty.
export async function seedOperationalData(): Promise<void> {
  if (await isDatabaseSeeded()) return;

  const robots = generateRobots();
  const drones = generateDrones();
  const alerts = generateAlerts();
  const resources = generateResources();
  const logs = generateActivityLogs();

  await supabase.from('robots').insert(robots).then((res) => {
    if (res.error) console.error('seed robots error', res.error);
  });
  await supabase.from('drones').insert(drones).then((res) => {
    if (res.error) console.error('seed drones error', res.error);
  });
  await supabase.from('alerts').insert(alerts).then((res) => {
    if (res.error) console.error('seed alerts error', res.error);
  });
  await supabase.from('resources').insert(resources).then((res) => {
    if (res.error) console.error('seed resources error', res.error);
  });
  await supabase.from('activity_logs').insert(logs.slice(0, 30)).then((res) => {
    if (res.error) console.error('seed activity_logs error', res.error);
  });
}

// Ensures the predefined commander account exists in Supabase Auth.
// Tries to sign up; if the user already exists, signUp returns the existing
// user (with a session) which we then sign out. This is a one-time bootstrap
// that does NOT require the user to be logged in.
export async function ensureCommanderAccount(): Promise<void> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'commander@roboweb.ai',
    password: 'Commander@123',
    options: {
      data: { role: 'commander', display_name: 'Sarah Johnson' },
    },
  });

  if (signUpError) {
    // User likely already exists - this is fine.
    return;
  }

  if (signUpData.user) {
    await ensureProfile(signUpData.user.id, 'commander', 'Sarah Johnson', 'commander@roboweb.ai', null, 'CMD001');
    // Sign out so the bootstrap session doesn't linger
    await supabase.auth.signOut();
  }
}

export async function ensureProfile(
  userId: string,
  role: 'commander' | 'client',
  displayName: string,
  email: string,
  phone: string | null,
  commanderId: string | null = null,
): Promise<void> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('profiles').insert({
    id: userId,
    role,
    display_name: displayName,
    email,
    phone,
    commander_id: commanderId,
  });
}
