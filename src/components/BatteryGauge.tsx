type Props = {
  value: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
};

const colorFor = (v: number) => {
  if (v >= 60) return '#00ff9f';
  if (v >= 30) return '#ffd60a';
  return '#ff2d55';
};

// Circular battery gauge with animated stroke and neon glow.
export default function BatteryGauge({ value, size = 80, label, showLabel = true }: Props) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorFor(clamped);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,229,255,0.1)"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-cyber-cyan" style={{ fontSize: size * 0.22 }}>
            {Math.round(clamped)}%
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-xs text-ocean-200/70 uppercase tracking-wider">{label}</span>
      )}
    </div>
  );
}
