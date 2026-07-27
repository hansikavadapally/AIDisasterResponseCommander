import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, AlertTriangle, Bot, Plane, ShieldAlert, Activity, Battery, Zap } from 'lucide-react';
import type { Notification } from '@/lib/supabase';

type Props = {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
};

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

export default function NotificationPanel({ notifications, onMarkAllRead, onMarkRead }: Props) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl glass border border-cyber-cyan/30 text-cyber-cyan hover:border-cyber-cyan/60 transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyber-red text-white text-[10px] font-bold px-1 animate-pulse">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md glass-strong border-l border-cyber-cyan/30 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-cyber-cyan/20">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-cyber-cyan" />
                  <h3 className="font-display font-bold text-white">Notifications</h3>
                  {unread > 0 && <span className="rounded-full bg-cyber-red/20 text-cyber-red text-[10px] px-2 py-0.5 font-bold">{unread} new</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllRead}
                    disabled={unread === 0}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/10 disabled:opacity-40 transition"
                  >
                    <CheckCheck size={14} /> Mark all
                  </button>
                  <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ocean-200 hover:text-cyber-red transition">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {notifications.length === 0 && (
                  <div className="text-center text-ocean-200/60 py-12">
                    <Bell size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
                {[...notifications]
                  .sort((a, b) => b.created_at.localeCompare(a.created_at))
                  .map((n) => {
                    const Icon = typeIcons[n.type] ?? Bell;
                    const color = typeColors[n.type] ?? 'text-ocean-300';
                    return (
                      <div
                        key={n.id}
                        className={`glass rounded-xl p-3 border ${n.read ? 'border-ocean-200/10 opacity-70' : 'border-cyber-cyan/30'} cursor-pointer hover:border-cyber-cyan/50 transition`}
                        onClick={() => !n.read && onMarkRead(n.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface-700/60 ${color} shrink-0`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                              {!n.read && <span className="h-2 w-2 rounded-full bg-cyber-cyan animate-pulse shrink-0" />}
                            </div>
                            <p className="text-xs text-ocean-200/70 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-ocean-200/50 mt-1 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
