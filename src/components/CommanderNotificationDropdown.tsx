import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, AlertTriangle, Bot, Plane, ShieldAlert, Activity, Battery, Zap, Check } from 'lucide-react';
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

const typeBg: Record<string, string> = {
  complaint: 'bg-cyber-yellow/10',
  assignment: 'bg-cyber-cyan/10',
  mission: 'bg-cyber-green/10',
  battery: 'bg-cyber-orange/10',
  drone: 'bg-cyber-blue/10',
  alert: 'bg-cyber-red/10',
  system: 'bg-ocean-300/10',
  fire: 'bg-cyber-red/10',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CommanderNotificationDropdown({ notifications, onMarkAllRead, onMarkRead }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const unread = notifications.filter((n) => !n.read).length;

  // Reposition dropdown whenever it opens
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const sorted = [...notifications].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      {/* Bell button — lives inside the header */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl glass border border-white/20 text-white hover:border-cyber-cyan/60 hover:text-cyber-cyan transition"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyber-red text-white text-[10px] font-bold px-1 shadow-glow-red">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown — portalled to body so it escapes the header's backdrop-filter */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropRef}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed z-[999] w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-cyber-cyan/30 shadow-glow-cyan overflow-hidden"
              style={{
                top: pos.top,
                right: pos.right,
                background: 'rgba(10,20,40,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              } as React.CSSProperties}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-cyan/20 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-cyber-cyan" />
                  <span className="font-display font-bold text-white text-sm">Notifications</span>
                  {unread > 0 && (
                    <span className="rounded-full bg-cyber-red/20 text-cyber-red text-[10px] px-2 py-0.5 font-bold border border-cyber-red/30">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onMarkAllRead(); }}
                    disabled={unread === 0}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/10 disabled:opacity-40 transition"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                  <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-ocean-200/60 hover:text-cyber-red transition">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {sorted.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-ocean-200/40">
                    <Bell size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
                {sorted.map((n, i) => {
                  const Icon = typeIcons[n.type] ?? Bell;
                  const color = typeColors[n.type] ?? 'text-ocean-300';
                  const bg = typeBg[n.type] ?? 'bg-ocean-300/10';
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && onMarkRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        n.read
                          ? 'opacity-60 hover:bg-white/5'
                          : 'hover:bg-cyber-cyan/5 border-l-2 border-cyber-cyan'
                      } ${i !== sorted.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      {/* Icon badge */}
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color} shrink-0 mt-0.5`}>
                        <Icon size={16} />
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-cyber-cyan shrink-0 mt-1.5 animate-pulse" />}
                        </div>
                        <p className="text-xs text-ocean-200/70 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-ocean-200/40 mt-1 font-mono">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
