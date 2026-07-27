import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Filter, AlertTriangle, Bot, Plane, ShieldAlert, Activity, Battery, Check, Zap } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';

const typeIcons: Record<string, typeof Bell> = {
  complaint: AlertTriangle,
  assignment: Bot,
  mission: Check,
  battery: Battery,
  drone: Plane,
  alert: ShieldAlert,
  system: Activity,
  fire: Zap,
};

const typeColors: Record<string, string> = {
  complaint: 'text-cyber-yellow',
  assignment: 'text-cyber-cyan',
  mission: 'text-cyber-green',
  battery: 'text-cyber-orange',
  drone: 'text-cyber-blue',
  alert: 'text-cyber-red',
  system: 'text-ocean-300',
  fire: 'text-cyber-red',
};

export default function NotificationCenter() {
  const { notifications, loading } = useCommanderData();
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'Unread') return notifications.filter((n) => !n.read);
    if (filter === 'Alerts') return notifications.filter((n) => n.type === 'alert' || n.type === 'fire');
    if (filter === 'Robots') return notifications.filter((n) => n.type === 'assignment' || n.type === 'battery');
    if (filter === 'Clients') return notifications.filter((n) => n.type === 'complaint' || n.type === 'mission');
    return notifications;
  }, [notifications, filter]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-cyber-cyan" />
            <h3 className="font-display font-bold text-white">Notification Center</h3>
            {unread > 0 && <span className="rounded-full bg-cyber-red/20 text-cyber-red text-xs px-2 py-0.5 font-bold">{unread} unread</span>}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-cyber-cyan/60" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2 text-sm text-white"
            >
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Alerts">Emergency Alerts</option>
              <option value="Robots">Robot Alerts</option>
              <option value="Clients">Client Alerts</option>
            </select>
            <button
              onClick={markAllRead}
              disabled={unread === 0}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/10 disabled:opacity-40 transition"
            >
              <CheckCheck size={16} /> Mark all read
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
        {filtered.map((n, i) => {
          const Icon = typeIcons[n.type] ?? Bell;
          const color = typeColors[n.type] ?? 'text-ocean-300';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => !n.read && markRead(n.id)}
              className={`glass rounded-xl p-4 border ${n.read ? 'border-ocean-200/10 opacity-70' : 'border-cyber-cyan/30 cursor-pointer hover:border-cyber-cyan/50'} transition`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-700/60 ${color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-cyber-cyan animate-pulse shrink-0" />}
                  </div>
                  <p className="text-xs text-ocean-200/70 mt-1">{n.message}</p>
                  <p className="text-[10px] text-ocean-200/50 mt-1 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
