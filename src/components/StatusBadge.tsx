type Status = string;

const statusStyles: Record<string, string> = {
  // Robot statuses
  Available: 'bg-cyber-green/15 text-cyber-green border-cyber-green/40',
  Assigned: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40',
  Travelling: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/40',
  'Rescue Started': 'bg-cyber-orange/15 text-cyber-orange border-cyber-orange/40',
  Returning: 'bg-cyber-purple/15 text-cyber-purple border-cyber-purple/40',
  Charging: 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/40',
  Offline: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
  // Drone statuses
  Monitoring: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40',
  Maintenance: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
  // Mission / complaint statuses
  Pending: 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/40',
  'Robot Assigned': 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40',
  'Robot En Route': 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/40',
  'Mission Completed': 'bg-cyber-green/15 text-cyber-green border-cyber-green/40',
  Completed: 'bg-cyber-green/15 text-cyber-green border-cyber-green/40',
  Cancelled: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
  Failed: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
  // Priorities
  Low: 'bg-ocean-300/15 text-ocean-300 border-ocean-300/40',
  Medium: 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/40',
  High: 'bg-cyber-orange/15 text-cyber-orange border-cyber-orange/40',
  Critical: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
};

export default function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'xs' | 'sm' | 'md' }) {
  const cls = statusStyles[status] ?? 'bg-ocean-300/15 text-ocean-300 border-ocean-300/40';
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium uppercase tracking-wider ${cls} ${sizes[size]}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
