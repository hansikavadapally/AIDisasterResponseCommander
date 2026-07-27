import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plane, Activity, CheckCircle2, AlertTriangle, Battery, CloudRain, Clock, Zap, ShieldAlert, TrendingUp, Wrench } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#00e5ff', '#1e90ff', '#00ff9f', '#ffd60a', '#ff9500', '#ff2d55', '#bf5af2'];

export default function CommanderDashboard() {
  const { robots, drones, complaints, missions, alerts, activityLogs, loading } = useCommanderData();

  const stats = useMemo(() => {
    const available = robots.filter((r) => r.status === 'Available').length;
    const assigned = robots.filter((r) => r.assigned).length;
    const charging = robots.filter((r) => r.status === 'Charging').length;
    const offline = robots.filter((r) => r.status === 'Offline').length;
    const activeDrones = drones.filter((d) => d.status === 'Monitoring').length;
    const emergencyMissions = missions.filter((m) => m.priority === 'Critical' && m.status !== 'Completed').length;
    const completed = missions.filter((m) => m.status === 'Completed').length;
    const activeComplaints = complaints.filter((c) => c.status !== 'Mission Completed' && c.status !== 'Cancelled').length;
    const avgBattery = robots.length > 0 ? Math.round(robots.reduce((s, r) => s + r.battery_percentage, 0) / robots.length) : 0;
    const criticalAlerts = alerts.filter((a) => a.active && a.severity === 'Critical').length;
    return { available, assigned, charging, offline, activeDrones, emergencyMissions, completed, activeComplaints, avgBattery, criticalAlerts };
  }, [robots, drones, complaints, missions, alerts]);

  const statusData = useMemo(() => {
    const grouped: Record<string, number> = {};
    robots.forEach((r) => { grouped[r.status] = (grouped[r.status] ?? 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [robots]);

  const batteryData = useMemo(() => {
    const buckets = { '0-30': 0, '31-60': 0, '61-100': 0 };
    robots.forEach((r) => {
      if (r.battery_percentage <= 30) buckets['0-30']++;
      else if (r.battery_percentage <= 60) buckets['31-60']++;
      else buckets['61-100']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [robots]);

  const missionTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => ({ day: d, missions: Math.floor(Math.random() * 8) + 2, completed: Math.floor(Math.random() * 6) + 1 }));
  }, []);

  const topRobots = useMemo(() => {
    return [...robots].sort((a, b) => b.rescue_success_rate - a.rescue_success_rate || b.total_rescue_missions - a.total_rescue_missions).slice(0, 5);
  }, [robots]);

  const topDrones = useMemo(() => {
    return [...drones].sort((a, b) => b.surveillance_missions - a.surveillance_missions || b.victims_detected - a.victims_detected).slice(0, 5);
  }, [drones]);

  const lowBatteryRobots = useMemo(() => robots.filter((r) => r.battery_percentage < 30).slice(0, 5), [robots]);
  const maintenanceRobots = useMemo(() => robots.filter((r) => r.status === 'Offline' || r.battery_percentage < 20).slice(0, 5), [robots]);
  const recentComplaints = useMemo(() => complaints.slice(0, 5), [complaints]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading command center...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard title="Total Robots" value={robots.length} icon={<Bot size={20} />} color="cyan" />
        <StatCard title="Available" value={stats.available} icon={<CheckCircle2 size={20} />} color="green" />
        <StatCard title="Assigned" value={stats.assigned} icon={<Activity size={20} />} color="blue" />
        <StatCard title="Charging" value={stats.charging} icon={<Zap size={20} />} color="yellow" />
        <StatCard title="Offline" value={stats.offline} icon={<AlertTriangle size={20} />} color="red" />
        <StatCard title="Total Drones" value={drones.length} icon={<Plane size={20} />} color="blue" />
        <StatCard title="Active Drones" value={stats.activeDrones} icon={<Plane size={20} />} color="cyan" />
        <StatCard title="Emergency Missions" value={stats.emergencyMissions} icon={<ShieldAlert size={20} />} color="red" />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 size={20} />} color="green" />
        <StatCard title="Active Complaints" value={stats.activeComplaints} icon={<AlertTriangle size={20} />} color="orange" />
        <StatCard title="Avg Battery" value={stats.avgBattery} icon={<Battery size={20} />} color="yellow" suffix="%" />
        <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={<ShieldAlert size={20} />} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-cyber-cyan" /> Weekly Mission Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={missionTrend}>
              <defs>
                <linearGradient id="g-miss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-comp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff9f" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00ff9f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
              <XAxis dataKey="day" stroke="#4fc3f7" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4fc3f7" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(10,20,40,0.95)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="missions" stroke="#00e5ff" fill="url(#g-miss)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#00ff9f" fill="url(#g-comp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4">Robot Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(10,20,40,0.95)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Battery + Activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Battery size={18} className="text-cyber-yellow" /> Battery Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={batteryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
              <XAxis dataKey="range" stroke="#4fc3f7" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4fc3f7" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(10,20,40,0.95)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#ffd60a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-cyber-cyan" /> Live Activity Log</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {activityLogs.slice(0, 12).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs bg-surface-700/40 rounded-lg px-3 py-2 border-l-2"
                style={{ borderColor: log.severity === 'critical' ? '#ff2d55' : log.severity === 'warning' ? '#ff9500' : log.severity === 'success' ? '#00ff9f' : '#00e5ff' }}>
                <Clock size={12} className="mt-0.5 text-ocean-200/60 shrink-0" />
                <span className="text-ocean-100 flex-1">{log.message}</span>
                <span className="text-ocean-200/50 font-mono shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top performers + low battery + recent complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Top Performing Robots" icon={<TrendingUp size={16} className="text-cyber-green" />}>
          {topRobots.map((r) => (
            <div key={r.robot_id} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
              <span className="text-white font-mono">{r.robot_id}</span>
              <span className="text-ocean-200/70 truncate ml-2 flex-1">{r.robot_name}</span>
              <span className="text-cyber-green font-mono">{r.rescue_success_rate}%</span>
            </div>
          ))}
        </Panel>

        <Panel title="Low Battery / Maintenance" icon={<Wrench size={16} className="text-cyber-orange" />}>
          {maintenanceRobots.length === 0 && lowBatteryRobots.length === 0 ? (
            <p className="text-xs text-ocean-200/60 p-2">All robots operational.</p>
          ) : (
            [...maintenanceRobots, ...lowBatteryRobots].slice(0, 5).map((r) => (
              <div key={r.robot_id} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
                <span className="text-white font-mono">{r.robot_id}</span>
                <span className="text-ocean-200/70 truncate ml-2 flex-1">{r.robot_name}</span>
                <StatusBadge status={r.status} size="xs" />
              </div>
            ))
          )}
        </Panel>

        <Panel title="Recent Client Requests" icon={<AlertTriangle size={16} className="text-cyber-yellow" />}>
          {recentComplaints.length === 0 ? (
            <p className="text-xs text-ocean-200/60 p-2">No complaints yet.</p>
          ) : (
            recentComplaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
                <span className="text-ocean-100 truncate flex-1">{c.title}</span>
                <StatusBadge status={c.status} size="xs" />
              </div>
            ))
          )}
        </Panel>
      </div>

      {/* Top drones + weather + disaster overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Top Performing Drones" icon={<Plane size={16} className="text-cyber-blue" />}>
          {topDrones.map((d) => (
            <div key={d.drone_id} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
              <span className="text-white font-mono">{d.drone_id}</span>
              <span className="text-ocean-200/70 truncate ml-2 flex-1">{d.drone_name}</span>
              <span className="text-cyber-blue font-mono">{d.victims_detected}v</span>
            </div>
          ))}
        </Panel>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><CloudRain size={18} className="text-cyber-blue" /> Weather</h3>
          <div className="text-center py-4">
            <CloudRain size={48} className="mx-auto text-cyber-blue mb-2" />
            <p className="font-display text-3xl font-bold text-white"><AnimatedCounter end={28} />°C</p>
            <p className="text-sm text-ocean-200/70">Partly Cloudy</p>
            <p className="text-xs text-ocean-200/50 mt-1">Wind 15 km/h • Humidity 62%</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-cyber-red" /> Disaster Overview</h3>
          <div className="space-y-2">
            {alerts.filter((a) => a.active).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs bg-surface-700/40 rounded-lg px-3 py-2">
                <span className="text-white">{a.alert_type}</span>
                <span className="text-ocean-200/60 truncate ml-2">{a.location}</span>
                <StatusBadge status={a.severity} size="xs" />
              </div>
            ))}
            {alerts.filter((a) => a.active).length === 0 && <p className="text-xs text-ocean-200/60 p-2">No active alerts.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">{icon}{title}</h3>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}
