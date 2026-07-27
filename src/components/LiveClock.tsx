export default function LiveClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <span className="font-mono text-cyber-cyan" suppressHydrationWarning>
      {date} {time}
    </span>
  );
}
