import { motion } from 'framer-motion';

// Cyberpunk animated background - grid, radar sweep, floating particles.
export default function CyberBackground() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 6,
    duration: Math.random() * 6 + 6,
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-surface-900">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid-cyber bg-grid-40 opacity-40" />

      {/* Radar sweep - center top */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[600px] w-[600px] opacity-20">
          <div className="absolute inset-0 rounded-full border border-cyber-cyan/30" />
          <div className="absolute inset-12 rounded-full border border-cyber-cyan/20" />
          <div className="absolute inset-24 rounded-full border border-cyber-cyan/10" />
          <div className="absolute inset-0 animate-radar-sweep bg-radar-sweep" />
        </div>
      </div>

      {/* Glow orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyber-cyan/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyber-blue/10 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyber-cyan/40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}
