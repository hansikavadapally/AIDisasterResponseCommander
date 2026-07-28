import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Bot, Plane, ShieldAlert, Activity, Battery, Zap, Check, Bell } from 'lucide-react';
import type { Notification } from '@/lib/supabase';

type ToastItem = {
  id: string;
  notification: Notification;
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

const typeBorder: Record<string, string> = {
  complaint: 'border-cyber-yellow/50',
  assignment: 'border-cyber-cyan/50',
  mission: 'border-cyber-green/50',
  battery: 'border-cyber-orange/50',
  drone: 'border-cyber-blue/50',
  alert: 'border-cyber-red/50',
  system: 'border-ocean-300/50',
  fire: 'border-cyber-red/50',
};

type Props = {
  notifications: Notification[];
};

// Watches the notifications array for NEW entries (notifications not seen before)
// and shows an animated toast popup for each one. Toasts auto-dismiss after 6s.
export default function CommanderToasts({ notifications }: Props) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // On mount or when notifications first load, mark existing as seen (don't toast them).
  useEffect(() => {
    if (notifications.length === 0) return;
    setSeenIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const n of notifications) {
        if (!next.has(n.id)) {
          if (prev.size === 0) {
            // First load — mark as seen, don't toast.
            next.add(n.id);
          } else {
            // New notification — toast it.
            next.add(n.id);
          }
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [notifications]);

  // Detect genuinely new notifications (after initial load) and create toasts.
  useEffect(() => {
    if (seenIds.size === 0 || notifications.length === 0) return;
    const newOnes = notifications.filter((n) => {
      // It's in seenIds (added above) but we need to check if it was added THIS cycle.
      // We use a simpler approach: track a ref of previous IDs.
      return false;
    });
    // Handled by the ref-based effect below for reliability.
    void newOnes;
  }, [notifications, seenIds]);

  // Reliable new-notification detection using a ref of known IDs.
  const [knownIds, setKnownIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (notifications.length === 0) return;
    if (knownIds === null) {
      // First load — seed without toasting.
      setKnownIds(new Set(notifications.map((n) => n.id)));
      return;
    }
    const fresh = notifications.filter((n) => !knownIds.has(n.id));
    if (fresh.length > 0) {
      setKnownIds(new Set([...knownIds, ...fresh.map((n) => n.id)]));
      setToasts((prev) => [
        ...prev,
        ...fresh.map((n) => ({ id: `${n.id}-${Date.now()}`, notification: n })),
      ]);
    }
  }, [notifications, knownIds]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dismiss(t.id), 6000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  return createPortal(
    <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {toasts.map((t) => {
          const n = t.notification;
          const Icon = typeIcons[n.type] ?? Bell;
          const color = typeColors[n.type] ?? 'text-ocean-300';
          const border = typeBorder[n.type] ?? 'border-ocean-300/50';
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 400, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`glass-strong rounded-xl border ${border} shadow-glow-cyan overflow-hidden`}
            >
              <div className="flex items-start gap-3 p-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-700/60 ${color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
                  <p className="text-xs text-ocean-200/70 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-1 text-ocean-200/60 hover:text-cyber-red transition shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="h-0.5 bg-cyber-cyan/30 animate-[shrink_6s_linear_forwards]" style={{ transformOrigin: 'left' }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
