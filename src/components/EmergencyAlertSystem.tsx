import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Volume2, VolumeX, Siren, Waves, Flame, Wind, Mountain, Cloud, Zap, Activity } from 'lucide-react';
import type { Alert } from '@/lib/supabase';

type Props = {
  alerts: Alert[];
  onDismiss: (id: string) => void;
};

const alertIcons: Record<string, typeof AlertTriangle> = {
  Earthquake: Activity,
  Flood: Waves,
  Fire: Flame,
  Cyclone: Wind,
  Landslide: Mountain,
  'Building Collapse': AlertTriangle,
  'Gas Leakage': Zap,
  Tsunami: Waves,
  'Communication Failure': Cloud,
};

const severityColor = {
  Low: 'text-cyber-yellow border-cyber-yellow/50',
  Medium: 'text-cyber-orange border-cyber-orange/50',
  High: 'text-cyber-red border-cyber-red/50',
  Critical: 'text-cyber-red border-cyber-red',
};

// Emergency Alert System: top flashing strip + full-width banner + popup + siren toggle.
export default function EmergencyAlertSystem({ alerts, onDismiss }: Props) {
  const [sirenOn, setSirenOn] = useState(false);
  const [activePopup, setActivePopup] = useState<Alert | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeCritical = alerts.filter(
    (a) => a.active && (a.severity === 'Critical' || a.severity === 'High') && !dismissedIds.has(a.id),
  );
  const showStrip = activeCritical.length > 0;

  // Auto-popup the first critical alert once
  useEffect(() => {
    if (activeCritical.length > 0 && !activePopup) {
      setActivePopup(activeCritical[0]);
    }
  }, [activeCritical, activePopup]);

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    setActivePopup(null);
    onDismiss(id);
  };

  return (
    <>
      {/* Flashing red warning strip at top */}
      <AnimatePresence>
        {showStrip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="warning-strip overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-1.5">
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle size={14} className="sos-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeCritical.length} Active {activeCritical.length > 1 ? 'Emergencies' : 'Emergency'} - {activeCritical[0]?.alert_type} at {activeCritical[0]?.location}
                </span>
              </div>
              <button
                onClick={() => setSirenOn((s) => !s)}
                className="flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60 transition"
              >
                {sirenOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <Siren size={14} className={sirenOn ? 'sos-pulse' : ''} />
                {sirenOn ? 'Siren ON' : 'Siren OFF'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-width animated banner listing active critical alerts */}
      {activeCritical.length > 0 && (
        <div className="relative overflow-hidden border-y border-cyber-red/30 bg-cyber-red/10">
          <div className="flex gap-4 p-2 overflow-x-auto">
            {activeCritical.map((a) => {
              const Icon = alertIcons[a.alert_type] ?? AlertTriangle;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-lg border ${severityColor[a.severity]} bg-surface-800/60 px-3 py-2 min-w-fit`}
                >
                  <Icon size={18} className="sos-pulse" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">{a.alert_type}</span>
                      <span className={`text-[10px] uppercase font-bold ${severityColor[a.severity].split(' ')[0]}`}>{a.severity}</span>
                    </div>
                    <p className="text-[11px] text-ocean-200/80">{a.location} - {a.description?.slice(0, 60)}...</p>
                  </div>
                  <button onClick={() => dismiss(a.id)} className="ml-2 text-ocean-200/60 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency popup */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setActivePopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl w-full max-w-md border-2 border-cyber-red animate-flash-border"
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyber-red/20 border-2 border-cyber-red sos-pulse">
                  {(() => {
                    const Icon = alertIcons[activePopup.alert_type] ?? AlertTriangle;
                    return <Icon size={32} className="text-cyber-red" />;
                  })()}
                </div>
                <h3 className="font-display text-xl font-bold text-cyber-red neon-text-red uppercase tracking-wider">{activePopup.alert_type} Alert</h3>
                <p className={`mt-1 text-sm font-bold uppercase ${severityColor[activePopup.severity].split(' ')[0]}`}>{activePopup.severity} Severity</p>
                <p className="mt-3 text-sm text-ocean-100">{activePopup.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                  <div className="glass rounded-lg p-2">
                    <p className="text-[10px] uppercase tracking-wider text-ocean-200/60">Location</p>
                    <p className="text-sm text-white font-mono">{activePopup.location}</p>
                  </div>
                  <div className="glass rounded-lg p-2">
                    <p className="text-[10px] uppercase tracking-wider text-ocean-200/60">Issued</p>
                    <p className="text-sm text-white font-mono">{new Date(activePopup.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => dismiss(activePopup.id)}
                    className="flex-1 rounded-lg bg-cyber-red/20 border border-cyber-red/60 text-cyber-red py-2 text-sm font-bold uppercase tracking-wider hover:bg-cyber-red/30 transition"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => setActivePopup(null)}
                    className="rounded-lg px-4 py-2 text-sm text-ocean-200 hover:text-white border border-ocean-200/30 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
