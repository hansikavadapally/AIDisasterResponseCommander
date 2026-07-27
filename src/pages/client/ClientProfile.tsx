import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, Save, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ClientProfile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ display_name: name, phone }).eq('id', user.id);
    // Also update user metadata
    await supabase.auth.updateUser({ data: { display_name: name, phone } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-green/15 text-cyber-green text-3xl font-bold border border-cyber-green/40">
            {profile?.display_name?.charAt(0) ?? 'C'}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">{profile?.display_name}</h3>
            <p className="text-sm text-cyber-green uppercase tracking-wider">Client</p>
            <p className="text-xs text-ocean-200/60 mt-1 font-mono">{user?.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyber-green/60 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
              <input
                type="email"
                value={profile?.email ?? ''}
                readOnly
                className="w-full rounded-xl bg-surface-700/40 border border-ocean-200/20 pl-10 pr-4 py-2.5 text-sm text-ocean-200/60"
              />
            </div>
            <p className="text-[10px] text-ocean-200/50 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/60" />
              <input
                type="tel"
                value={phone ?? ''}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl bg-surface-700/60 border border-cyber-green/20 pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyber-green/60 transition"
              />
            </div>
          </div>

          {saved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-cyber-green/10 border border-cyber-green/40 px-3 py-2 text-sm text-cyber-green">
              Profile updated successfully.
            </motion.div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl py-3 font-bold uppercase tracking-wider bg-cyber-green/15 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><Shield size={18} className="text-cyber-cyan" /> Account</h3>
        <div className="text-sm text-ocean-200/70 space-y-2 mb-4">
          <p>Account ID: <span className="font-mono text-cyber-cyan">{user?.id.slice(0, 16)}...</span></p>
          <p>Member since: <span className="text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span></p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl py-2.5 font-bold uppercase tracking-wider bg-cyber-red/10 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/20 transition flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </motion.div>
    </div>
  );
}
