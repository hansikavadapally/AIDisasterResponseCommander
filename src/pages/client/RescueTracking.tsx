import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Bot, Plane, Battery, MapPin, Clock, Activity, Phone, Zap, Gauge } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClientData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import type { Robot, Drone } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import BatteryGauge from '@/components/BatteryGauge';

export default function RescueTracking() {
  const { user } = useAuth();
  const { complaints, loading } = useClientData(user?.id);
  const [robot, setRobot] = useState<Robot | null>(null);
  const [drone, setDrone] = useState<Drone | null>(null);

  const activeComplaint = useMemo(
    () => complaints.find((c) => c.status !== 'Mission Completed' && c.status !== 'Cancelled'),
    [complaints]
  );

  useEffect(() => {
    if (!activeComplaint?.assigned_robot_id) { setRobot(null); return; }
    const load = () => supabase.from('robots').select('*').eq('robot_id', activeComplaint.assigned_robot_id).maybeSingle().then(({ data }) => setRobot(data as Robot | null));
    load();
    const sub = supabase.channel(`tracking-robot-${activeComplaint.assigned_robot_id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'robots' }, load).subscribe();
    return () => { void sub.unsubscribe(); };
  }, [activeComplaint?.assigned_robot_id]);

  useEffect(() => {
    if (!activeComplaint?.assigned_drone_id) { setDrone(null); return; }
    const load = () => supabase.from('drones').select('*').eq('drone_id', activeComplaint.assigned_drone_id).maybeSingle().then(({ data }) => setDrone(data as Drone | null));
    load();
    const sub = supabase.channel(`tracking-drone-${activeComplaint.assigned_drone_id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'drones' }, load).subscribe();
    return () => { void sub.unsubscribe(); };
  }, [activeComplaint?.assigned_drone_id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-green animate-pulse">Loading tracking...</div>;

  if (!activeComplaint) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <Crosshair size={48} className="mx-auto text-cyber-cyan/30 mb-3" />
        <p className="text-white font-semibold">No active rescue to track</p>
        <p className="text-sm text-ocean-200/70 mt-1">Submit a complaint and wait for a robot to be assigned.</p>
      </div>
    );
  }

  const steps = [
    { label: 'Pending', icon: Clock },
    { label: 'Robot Assigned', icon: Bot },
    { label: 'Robot En Route', icon: Activity },
    { label: 'Rescue Started', icon: Zap },
    { label: 'Mission Completed', icon: Crosshair },
  ];
  const order = ['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'];
  const currentIdx = order.indexOf(activeComplaint.status);

  return (
    <div className="space-y-4">
      {/* Large progress timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-white flex items-center gap-2"><Crosshair size={18} className="text-cyber-cyan" /> Rescue Tracking</h3>
            <p className="text-xs text-ocean-200/70 mt-1">{activeComplaint.title}</p>
          </div>
          <StatusBadge status={activeComplaint.status} size="md" />
        </div>

        {/* Big timeline */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const done = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step.label} className="flex items-center gap-2 md:flex-1">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`flex flex-col items-center gap-2 rounded-xl p-3 border flex-1 ${done ? 'bg-cyber-cyan/10 border-cyber-cyan/40' : 'bg-surface-700/40 border-ocean-200/10'} ${isCurrent ? 'shadow-glow-cyan' : ''}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-ocean-200/40'} ${isCurrent ? 'animate-glow-pulse' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider text-center ${done ? 'text-cyber-cyan' : 'text-ocean-200/40'}`}>{step.label}</span>
                </motion.div>
                {idx < steps.length - 1 && <div className={`hidden md:block h-0.5 w-4 ${done ? 'bg-cyber-cyan/40' : 'bg-ocean-200/10'}`} />}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Robot + drone details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {robot ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Bot size={18} className="text-cyber-cyan" /> Assigned Robot</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-white">{robot.robot_name}</p>
                <p className="text-xs text-ocean-200/60 font-mono">{robot.robot_id} • {robot.robot_type}</p>
              </div>
              <BatteryGauge value={robot.battery_percentage} size={70} label="Battery" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail icon={<Activity size={14} />} label="Live Status" value={<StatusBadge status={robot.status} size="xs" />} />
              <Detail icon={<MapPin size={14} />} label="Location" value={robot.current_location ?? 'N/A'} />
              <Detail icon={<Clock size={14} />} label="ETA" value={`${activeComplaint.eta_min ?? '--'} min`} />
              <Detail icon={<MapPin size={14} />} label="Distance" value={`${activeComplaint.distance_km ?? '--'} km`} />
              <Detail icon={<Gauge size={14} />} label="Speed" value={`${robot.speed} km/h`} />
              <Detail icon={<Battery size={14} />} label="Signal" value={`${robot.signal_strength}%`} />
            </div>
            <div className="mt-3 pt-3 border-t border-cyber-cyan/15 text-xs text-ocean-200/60">
              Last updated: {new Date(robot.last_updated).toLocaleString()}
            </div>
          </motion.div>
        ) : (
          <div className="glass rounded-2xl p-5 text-center text-ocean-200/60 py-12">
            <Bot size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No robot assigned yet.</p>
          </div>
        )}

        {drone ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Plane size={18} className="text-cyber-blue" /> Assigned Drone</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-white">{drone.drone_name}</p>
                <p className="text-xs text-ocean-200/60 font-mono">{drone.drone_id}</p>
              </div>
              <BatteryGauge value={drone.battery} size={70} label="Battery" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail icon={<Activity size={14} />} label="Status" value={<StatusBadge status={drone.status} size="xs" />} />
              <Detail icon={<MapPin size={14} />} label="Location" value={drone.location ?? 'N/A'} />
              <Detail icon={<Gauge size={14} />} label="Altitude" value={`${drone.altitude} m`} />
              <Detail icon={<Gauge size={14} />} label="Speed" value={`${drone.speed} km/h`} />
              <Detail icon={<Battery size={14} />} label="Camera" value={drone.camera_status} />
              <Detail icon={<Activity size={14} />} label="Mission" value={drone.mission ?? 'Standby'} />
            </div>
          </motion.div>
        ) : (
          <div className="glass rounded-2xl p-5 text-center text-ocean-200/60 py-12">
            <Plane size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No drone assigned.</p>
          </div>
        )}
      </div>

      {/* Commander notes + emergency contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeComplaint.commander_notes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold text-cyber-yellow mb-2 text-sm">Commander Notes</h3>
            <p className="text-sm text-ocean-100">{activeComplaint.commander_notes}</p>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-cyber-green mb-2 text-sm flex items-center gap-2"><Phone size={16} /> Emergency Contact</h3>
          <p className="text-sm text-white">Commander CMD001</p>
          <p className="text-sm text-cyber-green font-mono mt-1">+91 100 (Emergency Hotline)</p>
          <p className="text-xs text-ocean-200/60 mt-2">Available 24/7 for rescue coordination</p>
        </motion.div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-lg p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-ocean-200/60 flex items-center gap-1">{icon}{label}</p>
      <div className="text-sm text-white mt-1 font-mono">{value}</div>
    </div>
  );
}
