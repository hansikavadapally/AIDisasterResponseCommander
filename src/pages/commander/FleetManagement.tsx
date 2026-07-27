import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bot, Plane, SlidersHorizontal, Battery, Activity, MapPin } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import StatusBadge from '@/components/StatusBadge';
import BatteryGauge from '@/components/BatteryGauge';
import SignalIndicator from '@/components/SignalIndicator';
import RobotFlashCard from '@/components/RobotFlashCard';
import DroneFlashCard from '@/components/DroneFlashCard';
import type { Robot, Drone } from '@/lib/supabase';

type Tab = 'robots' | 'drones';
type SortKey = 'id' | 'battery' | 'status' | 'name';

export default function FleetManagement() {
  const { robots, drones, loading } = useCommanderData();
  const [tab, setTab] = useState<Tab>('robots');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('id');
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const robotStatuses = ['All', 'Available', 'Assigned', 'Travelling', 'Rescue Started', 'Returning', 'Charging', 'Offline'];
  const droneStatuses = ['All', 'Available', 'Monitoring', 'Returning', 'Charging', 'Maintenance'];

  const filteredRobots = useMemo(() => {
    let list = robots.filter((r) =>
      (search === '' || r.robot_name.toLowerCase().includes(search.toLowerCase()) || r.robot_id.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'All' || r.status === statusFilter)
    );
    list = [...list].sort((a, b) => {
      if (sortBy === 'battery') return b.battery_percentage - a.battery_percentage;
      if (sortBy === 'name') return a.robot_name.localeCompare(b.robot_name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.robot_id.localeCompare(b.robot_id);
    });
    return list;
  }, [robots, search, statusFilter, sortBy]);

  const filteredDrones = useMemo(() => {
    let list = drones.filter((d) =>
      (search === '' || d.drone_name.toLowerCase().includes(search.toLowerCase()) || d.drone_id.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'All' || d.status === statusFilter)
    );
    list = [...list].sort((a, b) => {
      if (sortBy === 'battery') return b.battery - a.battery;
      if (sortBy === 'name') return a.drone_name.localeCompare(b.drone_name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.drone_id.localeCompare(b.drone_id);
    });
    return list;
  }, [drones, search, statusFilter, sortBy]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading fleet...</div>;

  return (
    <div className="space-y-4">
      {/* Tab switch + filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => { setTab('robots'); setStatusFilter('All'); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'robots' ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40' : 'text-ocean-200 border border-transparent hover:bg-cyber-cyan/5'}`}
            >
              <Bot size={16} /> Robots ({robots.length})
            </button>
            <button
              onClick={() => { setTab('drones'); setStatusFilter('All'); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === 'drones' ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/40' : 'text-ocean-200 border border-transparent hover:bg-cyber-blue/5'}`}
            >
              <Plane size={16} /> Drones ({drones.length})
            </button>
          </div>

          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full rounded-xl bg-surface-700/60 border border-cyber-cyan/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-ocean-200/40 focus:border-cyber-cyan/60 transition"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
            >
              {(tab === 'robots' ? robotStatuses : droneStatuses).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-xl bg-surface-700/60 border border-cyber-cyan/20 px-3 py-2.5 text-sm text-white"
            >
              <option value="id">Sort: ID</option>
              <option value="name">Sort: Name</option>
              <option value="battery">Sort: Battery</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tab === 'robots'
          ? filteredRobots.map((r, i) => (
              <motion.div
                key={r.robot_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedRobot(r)}
                className="cyber-card rounded-xl p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-cyan/15 text-cyber-cyan group-hover:animate-glow-pulse">
                      <Bot size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate">{r.robot_name}</p>
                      <p className="text-[10px] text-ocean-200/60 font-mono">{r.robot_id}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} size="xs" />
                </div>
                <div className="flex items-center justify-between">
                  <BatteryGauge value={r.battery_percentage} size={50} showLabel={false} />
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <SignalIndicator value={r.signal_strength} size={20} />
                    <span className="text-ocean-200/60 flex items-center gap-1"><MapPin size={10} />{r.current_location?.split(' - ')[0] ?? 'N/A'}</span>
                    {r.assigned && <span className="text-cyber-cyan text-[10px]">On Mission</span>}
                  </div>
                </div>
              </motion.div>
            ))
          : filteredDrones.map((d, i) => (
              <motion.div
                key={d.drone_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedDrone(d)}
                className="cyber-card rounded-xl p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/15 text-cyber-blue group-hover:animate-glow-pulse">
                      <Plane size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate">{d.drone_name}</p>
                      <p className="text-[10px] text-ocean-200/60 font-mono">{d.drone_id}</p>
                    </div>
                  </div>
                  <StatusBadge status={d.status} size="xs" />
                </div>
                <div className="flex items-center justify-between">
                  <BatteryGauge value={d.battery} size={50} showLabel={false} />
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="text-ocean-200/60">Alt: {d.altitude}m</span>
                    <span className="text-ocean-200/60 flex items-center gap-1"><MapPin size={10} />{d.location?.split(' - ')[0] ?? 'N/A'}</span>
                    {d.mission && <span className="text-cyber-blue text-[10px]">Monitoring</span>}
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      {filteredRobots.length === 0 && tab === 'robots' && (
        <p className="text-center text-ocean-200/60 py-12">No robots match your filters.</p>
      )}
      {filteredDrones.length === 0 && tab === 'drones' && (
        <p className="text-center text-ocean-200/60 py-12">No drones match your filters.</p>
      )}

      {/* Flash cards */}
      <AnimatePresence>
        {selectedRobot && <RobotFlashCard robot={selectedRobot} onClose={() => setSelectedRobot(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedDrone && <DroneFlashCard drone={selectedDrone} onClose={() => setSelectedDrone(null)} />}
      </AnimatePresence>
    </div>
  );
}
