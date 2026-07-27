import { motion } from 'framer-motion';
import { X, Camera, Gauge, Clock, Star, Activity, Radio, Mountain, Eye } from 'lucide-react';
import type { Drone } from '@/lib/supabase';
import BatteryGauge from './BatteryGauge';
import StatusBadge from './StatusBadge';

type Props = {
  drone: Drone;
  onClose: () => void;
};

// Drone Information Flash Card with battery gauge, live telemetry, flight statistics and radar pulse.
export default function DroneFlashCard({ drone, onClose }: Props) {
  const missionHistory = Array.from({ length: 4 }, (_, i) => ({
    zone: `Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
    date: new Date(Date.now() - (i + 1) * 86400000 * Math.floor(Math.random() * 5 + 1)).toISOString().slice(0, 10),
    victims: Math.floor(Math.random() * 25),
    duration: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 50)}m`,
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
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/40">
              <Eye size={24} />
              {/* Radar pulse */}
              <span className="absolute inset-0 rounded-xl border border-cyber-blue/60 animate-ping" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">{drone.drone_name}</h3>
              <p className="text-xs text-ocean-200/70 font-mono">{drone.drone_id} • Surveillance Drone</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ocean-200 hover:text-cyber-red hover:bg-cyber-red/10 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Top row: battery + camera + status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 flex flex-col items-center">
              <BatteryGauge value={drone.battery} size={90} label="Battery" />
            </div>
            <div className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-ocean-200/70">Camera</span>
              <Camera size={28} className={drone.camera_status === 'Active' ? 'text-cyber-green' : 'text-cyber-yellow'} />
              <span className={`font-mono text-sm ${drone.camera_status === 'Active' ? 'text-cyber-green' : 'text-cyber-yellow'}`}>{drone.camera_status}</span>
            </div>
            <div className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-ocean-200/70">Status</span>
              <StatusBadge status={drone.status} size="md" />
              <div className="flex items-center gap-1 text-cyber-yellow">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < drone.performance_rating ? 'currentColor' : 'none'} className={i < drone.performance_rating ? '' : 'opacity-30'} />
                ))}
              </div>
              <span className="text-[10px] text-ocean-200/60">Performance Rating</span>
            </div>
          </div>

          {/* Live telemetry */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Activity size={14} /> Live Telemetry</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Telemetry icon={<Mountain size={14} />} label="Altitude" value={`${drone.altitude} m`} />
              <Telemetry icon={<Gauge size={14} />} label="Speed" value={`${drone.speed} km/h`} />
              <Telemetry icon={<Radio size={14} />} label="Camera" value={drone.camera_status} />
              <Telemetry icon={<Camera size={14} />} label="Location" value={drone.location ?? 'N/A'} />
            </div>
          </div>

          {/* Flight statistics */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Activity size={14} /> Flight Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Telemetry label="Flight Hours" value={`${drone.flight_hours.toFixed(1)} h`} />
              <Telemetry label="Surveillance Missions" value={String(drone.surveillance_missions)} />
              <Telemetry label="Victims Detected" value={String(drone.victims_detected)} />
              <Telemetry label="Detection Accuracy" value={`${drone.detection_accuracy}%`} />
            </div>
            {drone.mission && (
              <div className="mt-3 pt-3 border-t border-cyber-cyan/15">
                <p className="text-[11px] uppercase tracking-wider text-ocean-200/70">Current Mission</p>
                <p className="text-sm text-cyber-green mt-1">{drone.mission}</p>
              </div>
            )}
          </div>

          {/* Maintenance */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Clock size={14} /> Maintenance & Coordinates</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Telemetry label="Last Maintenance" value={drone.last_maintenance_date ?? 'N/A'} />
              <Telemetry label="Last Updated" value={new Date(drone.last_updated).toLocaleString()} />
              <Telemetry label="Latitude" value={drone.latitude?.toFixed(4) ?? 'N/A'} />
              <Telemetry label="Longitude" value={drone.longitude?.toFixed(4) ?? 'N/A'} />
            </div>
          </div>

          {/* Mission history */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-2"><Activity size={14} /> Previous Missions</h4>
            <div className="space-y-2">
              {missionHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyber-blue">{h.zone}</span>
                    <span className="text-ocean-200/60">{h.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cyber-green">{h.victims} victims</span>
                    <span className="text-ocean-200/60">{h.duration}</span>
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
