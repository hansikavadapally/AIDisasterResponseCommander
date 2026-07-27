import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClientData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/supabase';

const typeIcons: Record<string, string> = {
  complaint: '📝',
  assignment: '🤖',
  mission: '✅',
  battery: '🔋',
  drone: '🚁',
  alert: '⚠️',
  system: '⚙️',
  fire: '🔥',
};

export default function ClientNotifications() {
  const { user } = useAuth();
  const { notifications, loading } = useClientData(user?.id);
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'Unread') return notifications.filter((n) => !n.read);
    if (filter === 'Missions') return notifications.filter((n) => n.type === 'mission' || n.type === 'assignment');
    if (filter === 'Alerts') return notifications.filter((n) => n.type === 'alert' || n.type === 'fire');
    return notifications;
  }, [notifications, filter]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', ids);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-green animate-pulse">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-cyber-green" />
            <h3 className="font-display font-bold text-white">Notifications</h3>
            {unread > 0 && <span className="rounded-full bg-cyber-red/20 text-cyber-red text-xs px-2 py-0.5 font-bold">{unread} unread</span>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-cyber-green/60" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl bg-surface-700/60 border border-cyber-green/20 px-3 py-2 text-sm text-white">
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Missions">Mission Updates</option>
              <option value="Alerts">Emergency Alerts</option>
            </select>
            <button onClick={markAllRead} disabled={unread === 0} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/10 disabled:opacity-40 transition">
              <CheckCheck size={16} /> Mark all
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-ocean-200/60 py-16">
            <Bell size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
        {filtered.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => !n.read && markRead(n.id)}
            className={`glass rounded-xl p-4 border ${n.read ? 'border-ocean-200/10 opacity-70' : 'border-cyber-green/30 cursor-pointer hover:border-cyber-green/50'} transition`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">{typeIcons[n.type] ?? '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse shrink-0" />}
                </div>
                <p className="text-xs text-ocean-200/70 mt-1">{n.message}</p>
                <p className="text-[10px] text-ocean-200/50 mt-1 font-mono">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
