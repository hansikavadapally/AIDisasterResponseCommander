import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Award, Battery, Clock } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#00e5ff', '#1e90ff', '#00ff9f', '#ffd60a', '#ff9500', '#ff2d55', '#bf5af2'];

export default function Analytics() {
  const { robots, drones, complaints, missions, loading } = useCommanderData();

  const robotUsage = useMemo(() => {
    const grouped: Record<string, number> = {};
    robots.forEach((r) => { grouped[r.status] = (grouped[r.status] ?? 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [robots]);

  const batteryDist = useMemo(() => {
    const buckets = { 'Critical (0-20%)': 0, 'Low (21-40%)': 0, 'Medium (41-70%)': 0, 'High (71-100%)': 0 };
    robots.forEach((r) => {
      if (r.battery_percentage <= 20) buckets['Critical (0-20%)']++;
      else if (r.battery_percentage <= 40) buckets['Low (21-40%)']++;
      else if (r.battery_percentage <= 70) buckets['Medium (41-70%)']++;
      else buckets['High (71-100%)']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [robots]);

  const complaintCats = useMemo(() => {
    const grouped: Record<string, number> = {};
    complaints.forEach((c) => { grouped[c.emergency_type] = (grouped[c.emergency_type] ?? 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const disasterSeverity = useMemo(() => {
    const grouped: Record<string, number> = {};
    complaints.forEach((c) => { grouped[c.priority] = (grouped[c.priority] ?? 0) + 1; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const dailyMissions = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => ({ day: d, missions: Math.floor(Math.random() * 10) + 2, success: Math.floor(Math.random() * 8) + 1 }));
  }, []);

  const droneActivity = useMemo(() => {
    return drones.slice(0, 10).map((d) => ({ name: d.drone_id, hours: d.flight_hours, victims: d.victims_detected }));
  }, [drones]);

  const robotHealth = useMemo(() => {
    return {
      performance: Math.round(robots.reduce((s, r) => s + r.rescue_success_rate, 0) / (robots.length || 1)),
      battery: Math.round(robots.reduce((s, r) => s + r.battery_percentage, 0) / (robots.length || 1)),
      signal: Math.round(robots.reduce((s, r) => s + r.signal_strength, 0) / (robots.length || 1)),
      uptime: 92,
      missions: Math.round(robots.reduce((s, r) => s + r.total_rescue_missions, 0) / (robots.length || 1)),
      response: 78,
    };
  }, [robots]);

  const radarData = [
    { metric: 'Performance', value: robotHealth.performance },
    { metric: 'Battery', value: robotHealth.battery },
    { metric: 'Signal', value: robotHealth.signal },
    { metric: 'Uptime', value: robotHealth.uptime },
    { metric: 'Missions', value: Math.min(robotHealth.missions, 100) },
    { metric: 'Response', value: robotHealth.response },
  ];

  const robotRanking = useMemo(() => {
    return [...robots].sort((a, b) => b.rescue_success_rate - a.rescue_success_rate).slice(0, 10).map((r) => ({
      name: r.robot_id,
      success: r.rescue_success_rate,
      missions: r.total_rescue_missions,
    }));
  }, [robots]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading analytics...</div>;

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Avg Success Rate" value={`${robotHealth.performance}%`} icon={<Award size={18} />} color="text-cyber-green" />
        <KPI label="Avg Battery" value={`${robotHealth.battery}%`} icon={<Battery size={18} />} color="text-cyber-yellow" />
        <KPI label="Avg Response" value={`${robotHealth.response}%`} icon={<TrendingUp size={18} />} color="text-cyber-cyan" />
        <KPI label="Total Rescued" value={missions.filter((m) => m.status === 'Completed').length} icon={<Activity size={18} />} color="text-cyber-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Robot Utilization" icon={<BarChart3 size={16} className="text-cyber-cyan" />}>
          <PieChart>
            <Pie data={robotUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
              {robotUsage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Battery Distribution" icon={<Battery size={16} className="text-cyber-yellow" />}>
          <BarChart data={batteryDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
            <XAxis dataKey="range" stroke="#4fc3f7" tick={{ fontSize: 10 }} />
            <YAxis stroke="#4fc3f7" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#ffd60a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Complaint Categories" icon={<Activity size={16} className="text-cyber-orange" />}>
          <BarChart data={complaintCats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
            <XAxis type="number" stroke="#4fc3f7" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="#4fc3f7" tick={{ fontSize: 10 }} width={100} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#ff9500" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Disaster Severity" icon={<TrendingUp size={16} className="text-cyber-red" />}>
          <PieChart>
            <Pie data={disasterSeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {disasterSeverity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Daily Missions" icon={<BarChart3 size={16} className="text-cyber-blue" />}>
          <LineChart data={dailyMissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
            <XAxis dataKey="day" stroke="#4fc3f7" tick={{ fontSize: 11 }} />
            <YAxis stroke="#4fc3f7" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="missions" stroke="#00e5ff" strokeWidth={2} dot={{ fill: '#00e5ff' }} />
            <Line type="monotone" dataKey="success" stroke="#00ff9f" strokeWidth={2} dot={{ fill: '#00ff9f' }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Drone Activity" icon={<BarChart3 size={16} className="text-cyber-purple" />}>
          <BarChart data={droneActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
            <XAxis dataKey="name" stroke="#4fc3f7" tick={{ fontSize: 10 }} />
            <YAxis stroke="#4fc3f7" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="hours" fill="#bf5af2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="victims" fill="#00e5ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Robot Health Overview" icon={<Activity size={16} className="text-cyber-green" />}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,229,255,0.2)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#4fc3f7', fontSize: 10 }} />
            <PolarRadiusAxis stroke="rgba(0,229,255,0.3)" tick={{ fill: '#4fc3f7', fontSize: 9 }} />
            <Radar dataKey="value" stroke="#00ff9f" fill="#00ff9f" fillOpacity={0.3} strokeWidth={2} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ChartCard>

        <ChartCard title="Robot Performance Ranking" icon={<Award size={16} className="text-cyber-yellow" />}>
          <BarChart data={robotRanking} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.1)" />
            <XAxis type="number" stroke="#4fc3f7" tick={{ fontSize: 11 }} domain={[80, 100]} />
            <YAxis type="category" dataKey="name" stroke="#4fc3f7" tick={{ fontSize: 10 }} width={60} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="success" fill="#00ff9f" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

const tooltipStyle = { background: 'rgba(10,20,40,0.95)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 8 };

function KPI({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-ocean-200/70">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`font-display text-2xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">{icon}{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </motion.div>
  );
}
