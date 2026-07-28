import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, Plane, Activity, Bell, Clock, Battery, MapPin, Gauge, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClientData } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import type { Robot, Drone } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import BatteryGauge from '@/components/BatteryGauge';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function ClientDashboard() {
  const { profile, user } = useAuth();
  const { complaints, missions, notifications, loading } = useClientData(user?.id);
  const [robot, setRobot] = useState<Robot | null>(null);
  const [drone, setDrone] = useState<Drone | null>(null);

  const activeComplaint = useMemo(() => complaints.find((c) => c.status !== 'Mission Completed' && c.status !== 'Cancelled'), [complaints]);

  // Fetch assigned robot and drone for active complaint
  useEffect(() => {
    if (!activeComplaint?.assigned_robot_id) { setRobot(null); return; }
    supabase.from('robots').select('*').eq('robot_id', activeComplaint.assigned_robot_id).maybeSingle().then(({ data }) => setRobot(data as Robot | null));
  }, [activeComplaint?.assigned_robot_id]);

  useEffect(() => {
    if (!activeComplaint?.assigned_drone_id) { setDrone(null); return; }
    supabase.from('drones').select('*').eq('drone_id', activeComplaint.assigned_drone_id).maybeSingle().then(({ data }) => setDrone(data as Drone | null));
  }, [activeComplaint?.assigned_drone_id]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const active = complaints.filter((c) => c.status !== 'Mission Completed' && c.status !== 'Cancelled').length;
    const completed = complaints.filter((c) => c.status === 'Mission Completed').length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const unread = notifications.filter((n) => !n.read).length;
    return { total, active, completed, pending, unread };
  }, [complaints, notifications]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-green animate-pulse">Loading your dashboard...</div>;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="Total Requests" value={stats.total} icon={<FileText size={18} />} color="text-cyber-cyan" />
        <Card title="Active" value={stats.active} icon={<Activity size={18} />} color="text-cyber-blue" />
        <Card title="Completed" value={stats.completed} icon={<CheckCircle2 size={18} />} color="text-cyber-green" />
      </div>

      {/* Active rescue + assigned robot */}
      {activeComplaint ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white flex items-center gap-2"><Activity size={18} className="text-cyber-cyan" /> Active Rescue: {activeComplaint.title}</h3>
            <StatusBadge status={activeComplaint.status} size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Mission progress */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3">Mission Progress</h4>
              <div className="space-y-2">
                {['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'].map((step, idx) => {
                  const order = ['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'];
                  const current = order.indexOf(activeComplaint.status);
                  const done = idx <= current;
                  return (
                    <div key={step} className="flex items-center gap-2 text-xs">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${done ? 'bg-cyber-cyan/20 border-cyber-cyan/60 text-cyber-cyan' : 'border-ocean-200/20 text-ocean-200/40'}`}>
                        {done ? '✓' : idx + 1}
                      </div>
                      <span className={done ? 'text-white' : 'text-ocean-200/40'}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned robot */}
            {robot && (
              <div className="glass rounded-xl p-4">
                <h4 className="text-xs uppercase tracking-wider text-cyber-cyan mb-3 flex items-center gap-1"><Bot size={14} /> Assigned Robot</h4>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{robot.robot_name}</p>
                    <p className="text-[10px] text-ocean-200/60 font-mono">{robot.robot_id}</p>
                  </div>
                  <BatteryGauge value={robot.battery_percentage} size={56} showLabel={false} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <Row label="Status"><StatusBadge status={robot.status} size="xs" /></Row>
                  <Row label="ETA"><span className="text-cyber-green font-mono">{activeComplaint.eta_min ?? '--'} min</span></Row>
                  <Row label="Distance"><span className="text-cyber-cyan font-mono">{activeComplaint.distance_km ?? '--'} km</span></Row>
                  <Row label="Location"><span className="text-ocean-100">{robot.current_location ?? 'N/A'}</span></Row>
                </div>
              </div>
            )}

            {/* Assigned drone + mission details */}
            <div className="space-y-3">
              {drone && (
                <div className="glass rounded-xl p-4">
                  <h4 className="text-xs uppercase tracking-wider text-cyber-blue mb-3 flex items-center gap-1"><Plane size={14} /> Assigned Drone</h4>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{drone.drone_name}</p>
                      <p className="text-[10px] text-ocean-200/60 font-mono">{drone.drone_id}</p>
                    </div>
                    <BatteryGauge value={drone.battery} size={48} showLabel={false} />
                  </div>
                  <Row label="Altitude"><span className="text-cyber-blue font-mono">{drone.altitude}m</span></Row>
                </div>
              )}
              {activeComplaint.commander_notes && (
                <div className="glass rounded-xl p-4">
                  <h4 className="text-xs uppercase tracking-wider text-cyber-yellow mb-2">Commander Notes</h4>
                  <p className="text-xs text-ocean-100">{activeComplaint.commander_notes}</p>
                </div>
              )}
              <div className="glass rounded-xl p-4">
                <h4 className="text-xs uppercase tracking-wider text-cyber-green mb-2 flex items-center gap-1"><Phone size={12} /> Emergency Contact</h4>
                <p className="text-xs text-white">Commander CMD001</p>
                <p className="text-xs text-cyber-green font-mono">+91 100 (Emergency)</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8 text-center">
          <Activity size={48} className="mx-auto text-cyber-cyan/30 mb-3" />
          <p className="text-white font-semibold">No active rescue requests</p>
          <p className="text-sm text-ocean-200/70 mt-1">Submit a new complaint to request emergency assistance.</p>
        </motion.div>
      )}

      {/* Recent notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-cyber-yellow" /> Recent Updates</h3>
        <div className="space-y-2">
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className={`flex items-start gap-3 text-xs rounded-lg px-3 py-2 ${n.read ? 'bg-surface-700/30 opacity-70' : 'bg-surface-700/60 border-l-2 border-cyber-cyan'}`}>
              <Bell size={12} className="mt-0.5 text-cyber-cyan shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold">{n.title}</p>
                <p className="text-ocean-200/70 mt-0.5">{n.message}</p>
              </div>
              <span className="text-ocean-200/50 font-mono shrink-0">{new Date(n.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-xs text-ocean-200/60 p-2">No notifications yet.</p>}
        </div>
      </motion.div>
    </div>
  );
}

function Card({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-ocean-200/70">{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`font-display text-2xl font-bold ${color} mt-1`}><AnimatedCounter end={value} /></p>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ocean-200/60">{label}</span>
      {children}
    </div>
  );
}
