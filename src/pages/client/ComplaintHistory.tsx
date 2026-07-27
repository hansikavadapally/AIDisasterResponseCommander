import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, Clock, Bot, Plane } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClientData } from '@/hooks/useData';
import StatusBadge from '@/components/StatusBadge';

export default function ComplaintHistory() {
  const { user } = useAuth();
  const { complaints, loading } = useClientData(user?.id);

  const sorted = useMemo(() => [...complaints].sort((a, b) => b.created_at.localeCompare(a.created_at)), [complaints]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-green animate-pulse">Loading history...</div>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <h3 className="font-display font-bold text-white flex items-center gap-2"><History size={18} className="text-cyber-cyan" /> Complaint History</h3>
        <p className="text-xs text-ocean-200/70 mt-1">All your submitted emergency requests and their current status.</p>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center text-ocean-200/60 py-16">
            <History size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No complaints submitted yet.</p>
          </div>
        )}
        {sorted.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p className="text-[10px] text-ocean-200/60 font-mono">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={c.priority} size="xs" />
                <StatusBadge status={c.status} size="xs" />
              </div>
            </div>
            <p className="text-xs text-ocean-200/70 mb-3">{c.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-1 text-cyber-cyan font-mono">{c.emergency_type}</span>
              {c.assigned_robot_id && (
                <span className="flex items-center gap-1 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-1 text-cyber-cyan font-mono">
                  <Bot size={12} /> {c.assigned_robot_id}
                </span>
              )}
              {c.assigned_drone_id && (
                <span className="flex items-center gap-1 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 px-2 py-1 text-cyber-blue font-mono">
                  <Plane size={12} /> {c.assigned_drone_id}
                </span>
              )}
              {c.eta_min && (
                <span className="flex items-center gap-1 text-cyber-green font-mono">
                  <Clock size={12} /> ETA: {c.eta_min} min
                </span>
              )}
            </div>
            {/* Mini timeline */}
            <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
              {['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'].map((step, idx) => {
                const order = ['Pending', 'Robot Assigned', 'Robot En Route', 'Rescue Started', 'Mission Completed'];
                const current = order.indexOf(c.status);
                const done = idx <= current;
                return (
                  <div key={step} className="flex items-center gap-1 shrink-0">
                    <div className={`h-2 w-2 rounded-full ${done ? 'bg-cyber-cyan' : 'bg-ocean-200/20'}`} />
                    <span className={`text-[9px] uppercase ${done ? 'text-cyber-cyan' : 'text-ocean-200/40'}`}>{step}</span>
                    {idx < 4 && <div className={`h-0.5 w-4 ${done ? 'bg-cyber-cyan/40' : 'bg-ocean-200/10'}`} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
