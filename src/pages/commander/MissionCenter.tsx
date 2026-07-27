import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Clock, Bot, Plane, ArrowRight } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import StatusBadge from '@/components/StatusBadge';

const timeline = ['Pending', 'Assigned', 'Travelling', 'Rescue Started', 'Returning', 'Completed'];

export default function MissionCenter() {
  const { missions, complaints, loading } = useCommanderData();

  const enriched = useMemo(() => {
    return missions.map((m) => {
      const complaint = complaints.find((c) => c.id === m.complaint_id);
      return { ...m, complaint };
    });
  }, [missions, complaints]);

  const stats = useMemo(() => {
    return {
      total: missions.length,
      active: missions.filter((m) => m.status !== 'Completed' && m.status !== 'Failed').length,
      completed: missions.filter((m) => m.status === 'Completed').length,
      critical: missions.filter((m) => m.priority === 'Critical').length,
    };
  }, [missions]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading missions...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Total Missions" value={stats.total} color="text-cyber-cyan" />
        <StatBox label="Active" value={stats.active} color="text-cyber-blue" />
        <StatBox label="Completed" value={stats.completed} color="text-cyber-green" />
        <StatBox label="Critical Priority" value={stats.critical} color="text-cyber-red" />
      </div>

      {/* Mission list with timeline */}
      <div className="space-y-3">
        {enriched.map((m, i) => {
          const stepIdx = timeline.indexOf(m.status);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                    <Crosshair size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{m.mission_name}</p>
                    <p className="text-[10px] text-ocean-200/60 font-mono">
                      {m.id.slice(0, 8)} • {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.priority} size="xs" />
                  <StatusBadge status={m.status} size="xs" />
                </div>
              </div>

              {/* Mission timeline */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {timeline.map((step, idx) => (
                  <div key={step} className="flex items-center gap-1 shrink-0">
                    <div className={`flex flex-col items-center gap-1 ${idx <= stepIdx ? 'text-cyber-cyan' : 'text-ocean-200/40'}`}>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${idx <= stepIdx ? 'bg-cyber-cyan/20 border-cyber-cyan/60' : 'border-ocean-200/20'}`}>
                        {idx < stepIdx ? '✓' : idx + 1}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider whitespace-nowrap">{step}</span>
                    </div>
                    {idx < timeline.length - 1 && <ArrowRight size={12} className={idx < stepIdx ? 'text-cyber-cyan' : 'text-ocean-200/30'} />}
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                {m.robot_id && (
                  <span className="flex items-center gap-1 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-1 text-cyber-cyan font-mono">
                    <Bot size={12} /> {m.robot_id}
                  </span>
                )}
                {m.drone_id && (
                  <span className="flex items-center gap-1 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 px-2 py-1 text-cyber-blue font-mono">
                    <Plane size={12} /> {m.drone_id}
                  </span>
                )}
                {m.complaint && (
                  <span className="text-ocean-200/70">Client: {m.complaint.client_name}</span>
                )}
                <span className="flex items-center gap-1 text-ocean-200/60 ml-auto">
                  <Clock size={12} /> Progress: {m.progress}%
                </span>
              </div>
            </motion.div>
          );
        })}
        {enriched.length === 0 && <p className="text-center text-ocean-200/60 py-12">No missions yet. Assign a robot to a complaint to create a mission.</p>}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-ocean-200/70">{label}</p>
      <p className={`font-display text-2xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}
