import { motion } from 'framer-motion';
import { X, MapPin, Thermometer, Gauge, Clock, Star, Activity, Zap, Radio } from 'lucide-react';
import type { Robot } from '@/lib/supabase';
import BatteryGauge from './BatteryGauge';
import SignalIndicator from './SignalIndicator';
import StatusBadge from './StatusBadge';

type Props = {
  robot: Robot;
  onClose: () => void;
};

// Robot Information Flash Card - futuristic detailed panel with circular battery gauge,
// signal indicator, performance badge and animated status indicator.
export default function RobotFlashCard({ robot, onClose }: Props) {
  const deployHistory = Array.from({ length: 4 }, (_, i) => ({
    client: `Client${String(Math.floor(Math.random() * 40) + 1).padStart(3, '0')}`,
    date: new Date(Date.now() - (i + 1) * 86400000 * Math.floor(Math.random() * 5 + 1)).toISOString().slice(0, 10),
    duration: `${Math.floor(Math.random() * 90) + 20} min`,
    type: ['Earthquake', 'Flood', 'Fire', 'Landslide', 'Cyclone'][Math.floor(Math.random() * 5)],
    outcome: Math.random() > 0.15 ? 'Success' : 'Partial',
    rating: Math.floor(Math.random() * 2) + 3,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-5 border-b border-cyber-cyan/20 bg-surface-800/80 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 animate-glow-pulse">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">{robot.robot_name}</h3>
              <p className="text-xs text-ocean-200/70 font-mono">{robot.robot_id} • {robot.robot_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ocean-200 hover:text-cyber-red hover:bg-cyber-red/10 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Top row: battery + signal + status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 flex flex-col items-center">
              <BatteryGauge value={robot.battery_percentage} size={90} label="Battery" />
            </div>
            <div className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-ocean-200/70">Signal</span>
              <SignalIndicator value={robot.signal_strength} size={32} />
              <span className="font-mono text-sm text-cyber-green">{robot.signal_strength}%</span>
            </div>
            <div className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-ocean-200/70">Status</span>
              <StatusBadge status={robot.status} size="md" />
              <div className="flex items-center gap-1 text-cyber-yellow">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < robot.performance_rating ? 'currentColor' : 'none'} className={i < robot.performance_rating ? '' : 'opacity-30'} />
                ))}
              </div>
              <span className="text-[10px] text-ocean-200/60">Performance Rating</span>
            </div>
          </div>

          {/* Live telemetry */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Zap size={14} /> Live Telemetry</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Telemetry icon={<Thermometer size={14} />} label="Temperature" value={`${robot.temperature}°C`} />
              <Telemetry icon={<Gauge size={14} />} label="Speed" value={`${robot.speed} km/h`} />
              <Telemetry icon={<Radio size={14} />} label="Signal" value={`${robot.signal_strength}%`} />
              <Telemetry icon={<MapPin size={14} />} label="Location" value={robot.current_location ?? 'N/A'} />
            </div>
          </div>

          {/* Mission stats */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Activity size={14} /> Mission Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Telemetry label="Total Missions" value={String(robot.total_rescue_missions)} />
              <Telemetry label="Success Rate" value={`${robot.rescue_success_rate}%`} />
              <Telemetry label="Avg Mission Time" value={`${robot.avg_mission_time_min} min`} />
              <Telemetry label="Last Assigned" value={robot.last_assigned_client ?? 'None'} />
            </div>
            {robot.current_mission && (
              <div className="mt-3 pt-3 border-t border-cyber-cyan/15">
                <p className="text-[11px] uppercase tracking-wider text-ocean-200/70">Current Mission</p>
                <p className="text-sm text-cyber-green mt-1">{robot.current_mission}</p>
              </div>
            )}
          </div>

          {/* Maintenance + last updated */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Clock size={14} /> Maintenance & Updates</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Telemetry label="Last Maintenance" value={robot.last_maintenance_date ?? 'N/A'} />
              <Telemetry label="Last Updated" value={new Date(robot.last_updated).toLocaleString()} />
              <Telemetry label="Latitude" value={robot.latitude?.toFixed(4) ?? 'N/A'} />
              <Telemetry label="Longitude" value={robot.longitude?.toFixed(4) ?? 'N/A'} />
            </div>
          </div>

          {/* Deployment history */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Activity size={14} /> Deployment History</h4>
            <div className="space-y-2">
              {deployHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyber-cyan">{h.client}</span>
                    <span className="text-ocean-200/70">{h.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ocean-200/60">{h.date}</span>
                    <span className="text-ocean-200/60">{h.duration}</span>
                    <span className={h.outcome === 'Success' ? 'text-cyber-green' : 'text-cyber-yellow'}>{h.outcome}</span>
                    <span className="flex items-center gap-0.5 text-cyber-yellow">
                      {Array.from({ length: h.rating }).map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Telemetry({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ocean-200/60 flex items-center gap-1">{icon}{label}</p>
      <p className="font-mono text-sm text-white mt-0.5 truncate">{value}</p>
    </div>
  );
}
