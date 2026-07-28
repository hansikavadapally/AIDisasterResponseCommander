import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Palette, Globe, Activity, Shield, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CommanderSettings() {
  const { profile } = useAuth();
  const [theme, setTheme] = useState('Deep Ocean');
  const [language, setLanguage] = useState('English');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSiren, setNotifSiren] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Degraded' | 'Offline'>('Online');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><User size={18} className="text-cyber-cyan" /> Commander Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-cyan/15 text-cyber-cyan text-2xl font-bold border border-cyber-cyan/40">
              {profile?.display_name?.charAt(0) ?? 'C'}
            </div>
            <div>
              <p className="text-white font-semibold">{profile?.display_name}</p>
              <p className="text-xs text-cyber-cyan font-mono">{profile?.commander_id ?? 'CMD-???'}</p>
              <p className="text-xs text-ocean-200/70">{profile?.email}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <Field label="Display Name" value={profile?.display_name ?? ''} />
            <Field label="Email" value={profile?.email ?? ''} />
            <Field label="Phone" value={profile?.phone ?? 'Not set'} />
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Palette size={18} className="text-cyber-purple" /> Theme</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white">
                <option>Deep Ocean</option>
                <option>Cyberpunk Neon</option>
                <option>Military Command</option>
                <option>SpaceX Dark</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex-1 rounded-xl py-2 text-sm text-cyber-yellow border border-cyber-yellow/30 hover:bg-cyber-yellow/10 flex items-center justify-center gap-2"><Moon size={14} /> Dark Mode</button>
              <button className="flex-1 rounded-xl py-2 text-sm text-ocean-200/40 border border-ocean-200/20 flex items-center justify-center gap-2 opacity-50"><Sun size={14} /> Light Mode</button>
            </div>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Globe size={18} className="text-cyber-blue" /> Language & Region</h3>
          <div>
            <label className="text-xs uppercase tracking-wider text-ocean-200/70 mb-1.5 block">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white">
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-cyber-yellow" /> Notification Preferences</h3>
          <div className="space-y-3">
            <Toggle label="Email Notifications" checked={notifEmail} onChange={setNotifEmail} icon={<Activity size={14} />} />
            <Toggle label="Push Notifications" checked={notifPush} onChange={setNotifPush} icon={<Bell size={14} />} />
            <Toggle label="Emergency Siren" checked={notifSiren} onChange={setNotifSiren} icon={notifSiren ? <Volume2 size={14} /> : <VolumeX size={14} />} />
          </div>
        </motion.div>
      </div>

      {/* System status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-cyber-green" /> System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusBox label="API Status" value={systemStatus} ok={systemStatus === 'Online'} />
          <StatusBox label="Realtime Sync" value="Active" ok />
          <StatusBox label="Database" value="Connected" ok />
          <StatusBox label="AI Engine" value="Operational" ok />
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ocean-200/60">{label}</p>
      <p className="text-white mt-0.5">{value}</p>
    </div>
  );
}

function Toggle({ label, checked, onChange, icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-ocean-100 flex items-center gap-2">{icon}{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-cyber-cyan/40' : 'bg-surface-700'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full transition ${checked ? 'left-5 bg-cyber-cyan' : 'left-0.5 bg-ocean-200/40'}`} />
      </button>
    </label>
  );
}

function StatusBox({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-xs uppercase tracking-wider text-ocean-200/70">{label}</p>
      <p className={`font-display text-sm font-bold mt-1 flex items-center gap-1.5 ${ok ? 'text-cyber-green' : 'text-cyber-red'}`}>
        <span className={`h-2 w-2 rounded-full ${ok ? 'bg-cyber-green' : 'bg-cyber-red'} animate-pulse`} />
        {value}
      </p>
    </div>
  );
}
