import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Bot, Plane, ShieldAlert, Activity, Battery, Zap, Check } from 'lucide-react';
import type { Notification } from '@/lib/supabase';

type Props = {
  notifications: Notification[];
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

const typeBorders: Record<string, string> = {
  complaint: 'border-cyber-yellow/50',
  assignment: 'border-cyber-cyan/50',
  mission: 'border-cyber-green/50',
  battery: 'border-cyber-orange/50',
  drone: 'border-cyber-blue/50',
  alert: 'border-cyber-red/50',
  system: 'border-ocean-300/50',
  fire: 'border-cyber-red/50',
};

const AUTO_DISMISS_MS = 6000;

export default function LiveNotificationToasts({ notifications }: Props) {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    // On first load, seed seen-ids from existing notifications so historical
    // ones don't all pop as toasts. Only truly new inserts should toast.
    if (!initialized.current && notifications.length > 0) {
      notifications.forEach((n) => seenIds.current.add(n.id));
      initialized.current = true;
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    const fresh = notifications.filter((n) => !seenIds.current.has(n.id));
    if (fresh.length > 0) {
      fresh.forEach((n) => seenIds.current.add(n.id));
      setToasts((prev) => [...prev, ...fresh]);
    }
  }, [notifications]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 pointer-events-none w-[calc(100vw-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((n) => {
          const Icon = typeIcons[n.type] ?? Bell;
          const color = typeColors[n.type] ?? 'text-ocean-300';
          const border = typeBorders[n.type] ?? 'border-cyber-cyan/50';
          return (
            <ToastItem key={n.id} n={n} Icon={Icon} color={color} border={border} onDismiss={() => dismiss(n.id)} />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  n,
  Icon,
  color,
  border,
  onDismiss,
}: {
  n: Notification;
  Icon: typeof Bell;
  color: string;
  border: string;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100));
    }, 60);
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 120, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`pointer-events-auto glass-strong rounded-xl border ${border} shadow-glow-cyan overflow-hidden`}
    >
      <div className="flex items-start gap-3 p-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-700/70 ${color} shrink-0`}>
          <Icon size={18} className={n.type === 'complaint' || n.type === 'alert' || n.type === 'fire' ? 'animate-pulse' : ''} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white truncate">{n.title}</p>
            <button onClick={onDismiss} className="rounded p-0.5 text-ocean-200/60 hover:text-cyber-red transition shrink-0">
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-ocean-200/80 mt-0.5 line-clamp-2">{n.message}</p>
          <p className="text-[10px] text-ocean-200/40 mt-1 font-mono">{timeAgo(n.created_at)}</p>
        </div>
      </div>
      <div className="h-0.5 bg-surface-700/50">
        <div className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-75 ease-linear`} style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

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
