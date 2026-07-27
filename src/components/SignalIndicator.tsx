type Props = {
  value: number;
  size?: number;
};

const bars = 5;

// Signal strength indicator with animated bars.
export default function SignalIndicator({ value, size = 24 }: Props) {
  const active = Math.round((value / 100) * bars);
  const color = value >= 60 ? '#00ff9f' : value >= 30 ? '#ffd60a' : '#ff2d55';
  return (
    <div className="flex items-end gap-0.5" style={{ height: size }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-sm transition-all duration-300"
          style={{
            height: `${((i + 1) / bars) * size}px`,
            background: i < active ? color : 'rgba(0,229,255,0.15)',
            boxShadow: i < active ? `0 0 4px ${color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}
