import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Bot, Plane, Search, Filter, Send, AlertTriangle } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { assignResourcesToComplaint, advanceComplaintStatus } from '@/lib/assignment';
import type { Complaint, Robot, Drone } from '@/lib/supabase';

type Assignment = {
  id: string;
  commander_name: string;
  commander_display_id: string;
  robot_id: string | null;
  drone_id: string | null;
  assigned_at: string;
};

export default function ClientRequests() {
  const { profile } = useAuth();
  const { complaints, robots, drones, loading } = useCommanderData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [assignRobotId, setAssignRobotId] = useState('');
  const [assignDroneId, setAssignDroneId] = useState('');
  const [notes, setNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const filtered = useMemo(() => {
    return complaints.filter((c) =>
      (search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.client_name.toLowerCase().includes(search.toLowerCase()) || c.emergency_type.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'All' || c.status === statusFilter)
    );
  }, [complaints, search, statusFilter]);

  const availableRobots = robots.filter((r) => r.status === 'Available');
  const availableDrones = drones.filter((d) => d.status === 'Available' || d.status === 'Monitoring');

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    setAssignMsg(null);
    const robot = assignRobotId ? robots.find((r) => r.robot_id === assignRobotId) ?? null : null;
    const drone = assignDroneId ? drones.find((d) => d.drone_id === assignDroneId) ?? null : null;
    const { error } = await assignResourcesToComplaint({ complaint: selected, robot, drone, commander: profile!, commanderNotes: notes });
    setAssigning(false);
    if (error) {
      setAssignMsg(`Error: ${error}`);
    } else {
      setAssignMsg('Resources assigned successfully. Client has been notified.');
      setSelected(null);
      setAssignRobotId('');
      setAssignDroneId('');
      setNotes('');
    }
  };

  const openModal = (c: Complaint) => {
    setSelected(c);
    setAssignMsg(null);
    setAssignRobotId(c.assigned_robot_id ?? '');
    setAssignDroneId(c.assigned_drone_id ?? '');
    setNotes(c.commander_notes ?? '');
    setAssignment(null);
    if (c.status !== 'Pending') {
      supabase
        .from('assignments')
        .select('id, commander_name, commander_display_id, robot_id, drone_id, assigned_at')
        .eq('complaint_id', c.id)
        .maybeSingle()
        .then(({ data }) => setAssignment(data as Assignment | null));
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-cyber-cyan/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Robot Assigned">Robot Assigned</option>
              <option value="Robot En Route">Robot En Route</option>
              <option value="Rescue Started">Rescue Started</option>
              <option value="Mission Completed">Mission Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="cyber-card rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={c.priority === 'Critical' ? 'text-cyber-red' : c.priority === 'High' ? 'text-cyber-orange' : 'text-cyber-yellow'} />
                <span className="text-sm font-semibold text-white truncate">{c.title}</span>
              </div>
              <StatusBadge status={c.priority} size="xs" />
            </div>
            <p className="text-xs text-ocean-200/70 line-clamp-2 mb-2">{c.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-ocean-200/60 mb-3">
              <span className="font-mono text-cyber-cyan">{c.emergency_type}</span>
              <span>{c.client_name}</span>
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={c.status} size="xs" />
              <button
                onClick={() => openModal(c)}
                className="rounded-lg px-3 py-1.5 text-xs cyber-btn font-semibold"
              >
                {c.status === 'Pending' ? 'Assign' : 'Details'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-ocean-200/60 py-12">No complaints found.</p>}

      {/* Assignment modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-cyber-cyan/20 bg-surface-800/80">
                <h3 className="font-display font-bold text-white flex items-center gap-2"><FileText size={18} className="text-cyber-cyan" /> Complaint Details</h3>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-ocean-200 hover:text-cyber-red"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ocean-200/60">Title</p>
                  <p className="text-white font-semibold">{selected.title}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ocean-200/60">Description</p>
                  <p className="text-sm text-ocean-100">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Client</p><p className="text-white">{selected.client_name}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Type</p><p className="text-cyber-cyan">{selected.emergency_type}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Priority</p><StatusBadge status={selected.priority} size="sm" /></div>
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Status</p><StatusBadge status={selected.status} size="sm" /></div>
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Location</p><p className="text-white">{selected.location ?? 'N/A'}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-ocean-200/60">Submitted</p><p className="text-white">{new Date(selected.created_at).toLocaleString()}</p></div>
                </div>

                {assignment && (
                  <div className="glass rounded-lg p-3 border border-cyber-cyan/20">
                    <p className="text-xs uppercase tracking-wider text-ocean-200/60 mb-1">Assigned By</p>
                    <div className="flex items-center justify-between">
                      <p className="text-cyber-cyan font-mono">{assignment.commander_display_id}</p>
                      <p className="text-sm text-white">{assignment.commander_name}</p>
                    </div>
                    <p className="text-[10px] text-ocean-200/50 mt-1">
                      {new Date(assignment.assigned_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {selected.status === 'Pending' ? (
                  <>
                    <div className="pt-3 border-t border-cyber-cyan/15">
                      <h4 className="text-sm font-bold text-cyber-cyan mb-3 flex items-center gap-2"><Bot size={16} /> Assign Rescue Robot</h4>
                      <select
                        value={assignRobotId}
                        onChange={(e) => setAssignRobotId(e.target.value)}
                        className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">No robot selected</option>
                        {availableRobots.map((r) => (
                          <option key={r.robot_id} value={r.robot_id}>
                            {r.robot_id} • {r.robot_name} • {r.battery_percentage}% • {r.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-cyber-blue mb-3 flex items-center gap-2"><Plane size={16} /> Assign Surveillance Drone</h4>
                      <select
                        value={assignDroneId}
                        onChange={(e) => setAssignDroneId(e.target.value)}
                        className="w-full rounded-xl bg-surface-700/60 border border-cyber-blue/20 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">No drone selected</option>
                        {availableDrones.map((d) => (
                          <option key={d.drone_id} value={d.drone_id}>
                            {d.drone_id} • {d.drone_name} • {d.battery}% • {d.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-ocean-200/60 mb-1.5 block">Commander Notes (optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Instructions for the client..."
                        className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
                      />
                    </div>

                    {assignMsg && (
                      <div className={`rounded-lg px-3 py-2 text-sm ${assignMsg.startsWith('Error') ? 'bg-cyber-red/10 border border-cyber-red/40 text-cyber-red' : 'bg-cyber-green/10 border border-cyber-green/40 text-cyber-green'}`}>
                        {assignMsg}
                      </div>
                    )}

                    <button
                      onClick={handleAssign}
                      disabled={assigning || (!assignRobotId && !assignDroneId)}
                      className="w-full cyber-btn rounded-xl py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={16} /> {assigning ? 'Assigning...' : 'Assign Resources'}
                    </button>
                  </>
                ) : (
                  <div className="pt-3 border-t border-cyber-cyan/15 space-y-3">
                    {selected.assigned_robot_id && (
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wider text-ocean-200/60 mb-1">Assigned Robot</p>
                        <p className="text-cyber-cyan font-mono">{selected.assigned_robot_id}</p>
                      </div>
                    )}
                    {selected.assigned_drone_id && (
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wider text-ocean-200/60 mb-1">Assigned Drone</p>
                        <p className="text-cyber-blue font-mono">{selected.assigned_drone_id}</p>
                      </div>
                    )}
                    {selected.commander_notes && (
                      <div className="glass rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wider text-ocean-200/60 mb-1">Commander Notes</p>
                        <p className="text-sm text-ocean-100">{selected.commander_notes}</p>
                      </div>
                    )}
                    {selected.eta_min && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-lg p-3"><p className="text-xs uppercase tracking-wider text-ocean-200/60">ETA</p><p className="text-cyber-green font-mono">{selected.eta_min} min</p></div>
                        <div className="glass rounded-lg p-3"><p className="text-xs uppercase tracking-wider text-ocean-200/60">Distance</p><p className="text-cyber-cyan font-mono">{selected.distance_km} km</p></div>
                      </div>
                    )}
                    {selected.status !== 'Mission Completed' && (
                      <button
                        onClick={() => handleAdvance(selected.id)}
                        className="w-full rounded-xl py-2.5 font-bold uppercase tracking-wider bg-cyber-green/15 border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/25 transition"
                      >
                        Advance to Next Status
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
