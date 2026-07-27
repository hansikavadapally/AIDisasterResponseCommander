import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plane, AlertTriangle, Ambulance, Zap, HelpCircle } from 'lucide-react';
import { useCommanderData } from '@/hooks/useData';
import DisasterMap from '@/components/DisasterMap';

export default function DisasterMapView() {
  const { robots, drones, alerts, complaints, loading } = useCommanderData();

  const hospitals = useMemo(() => {
    const baseLat = 19.076;
    const baseLng = 72.8777;
    return [
      { name: 'Central Hospital', lat: baseLat + 0.05, lng: baseLng + 0.04 },
      { name: 'Riverside Medical', lat: baseLat - 0.07, lng: baseLng + 0.06 },
      { name: 'Emergency Care Unit', lat: baseLat + 0.08, lng: baseLng - 0.05 },
      { name: 'Field Hospital A', lat: baseLat - 0.05, lng: baseLng - 0.08 },
    ];
  }, []);

  const chargingStations = useMemo(() => {
    const baseLat = 19.076;
    const baseLng = 72.8777;
    return [
      { name: 'Charging Station Alpha', lat: baseLat + 0.02, lng: baseLng - 0.03 },
      { name: 'Charging Station Beta', lat: baseLat - 0.03, lng: baseLng + 0.02 },
      { name: 'Charging Station Gamma', lat: baseLat + 0.06, lng: baseLng + 0.08 },
    ];
  }, []);

  const victims = useMemo(() => {
    return complaints
      .filter((c) => c.status !== 'Mission Completed' && c.status !== 'Cancelled' && c.latitude && c.longitude)
      .map((c) => ({ name: `Victim: ${c.client_name}`, lat: c.latitude as number, lng: c.longitude as number }));
  }, [complaints]);

  const missions = useMemo(() => {
    return complaints
      .filter((c) => c.assigned_robot_id && c.latitude && c.longitude)
      .map((c) => {
        const robot = robots.find((r) => r.robot_id === c.assigned_robot_id);
        if (!robot || !robot.latitude || !robot.longitude) return null;
        return { from: { lat: robot.latitude, lng: robot.longitude }, to: { lat: c.latitude as number, lng: c.longitude as number } };
      })
      .filter((m): m is { from: { lat: number; lng: number }; to: { lat: number; lng: number } } => m !== null);
  }, [complaints, robots]);

  if (loading) return <div className="flex items-center justify-center h-64 text-cyber-cyan animate-pulse">Loading map...</div>;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-white uppercase tracking-wider mr-2">Map Legend:</span>
          <LegendItem icon={<Bot size={14} className="text-cyber-cyan" />} label="Robots" count={robots.length} />
          <LegendItem icon={<Plane size={14} className="text-cyber-blue" />} label="Drones" count={drones.length} />
          <LegendItem icon={<AlertTriangle size={14} className="text-cyber-red" />} label="Alerts" count={alerts.filter((a) => a.active).length} />
          <LegendItem icon={<Ambulance size={14} className="text-cyber-green" />} label="Hospitals" count={hospitals.length} />
          <LegendItem icon={<Zap size={14} className="text-cyber-yellow" />} label="Charging" count={chargingStations.length} />
          <LegendItem icon={<HelpCircle size={14} className="text-cyber-orange" />} label="Victims" count={victims.length} />
        </div>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-2">
        <DisasterMap
          robots={robots}
          drones={drones}
          alerts={alerts.filter((a) => a.active)}
          hospitals={hospitals}
          chargingStations={chargingStations}
          victims={victims}
          missions={missions}
          height="600px"
        />
      </motion.div>

      {/* Active disaster alerts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.filter((a) => a.active).slice(0, 9).map((a) => (
          <div key={a.id} className="cyber-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className={a.severity === 'Critical' ? 'text-cyber-red sos-pulse' : a.severity === 'High' ? 'text-cyber-orange' : 'text-cyber-yellow'} />
              <span className="text-sm font-semibold text-white">{a.alert_type}</span>
              <span className={`text-[10px] uppercase font-bold ml-auto ${a.severity === 'Critical' ? 'text-cyber-red' : a.severity === 'High' ? 'text-cyber-orange' : 'text-cyber-yellow'}`}>{a.severity}</span>
            </div>
            <p className="text-xs text-ocean-200/70">{a.location}</p>
            <p className="text-xs text-ocean-200/60 mt-1 line-clamp-2">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-ocean-100">
      {icon}
      <span>{label}</span>
      <span className="rounded-full bg-surface-700/60 px-1.5 py-0.5 text-[10px] text-cyber-cyan font-mono">{count}</span>
    </div>
  );
}
