import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import AnimatedCounter from './AnimatedCounter';

type Props = {
  title: string;
  value: number;
  icon: ReactNode;
  color?: 'cyan' | 'green' | 'red' | 'orange' | 'blue' | 'yellow' | 'purple';
  suffix?: string;
  decimals?: number;
  subtitle?: string;
};

const colorMap = {
  cyan: { text: 'text-cyber-cyan', border: 'border-cyber-cyan/40', glow: 'shadow-glow-cyan', bg: 'bg-cyber-cyan/10' },
  green: { text: 'text-cyber-green', border: 'border-cyber-green/40', glow: 'shadow-glow-green', bg: 'bg-cyber-green/10' },
  red: { text: 'text-cyber-red', border: 'border-cyber-red/40', glow: 'shadow-glow-red', bg: 'bg-cyber-red/10' },
  orange: { text: 'text-cyber-orange', border: 'border-cyber-orange/40', glow: 'shadow-glow-orange', bg: 'bg-cyber-orange/10' },
  blue: { text: 'text-cyber-blue', border: 'border-cyber-blue/40', glow: 'shadow-glow-blue', bg: 'bg-cyber-blue/10' },
  yellow: { text: 'text-cyber-yellow', border: 'border-cyber-yellow/40', glow: '', bg: 'bg-cyber-yellow/10' },
  purple: { text: 'text-cyber-purple', border: 'border-cyber-purple/40', glow: '', bg: 'bg-cyber-purple/10' },
};

export default function StatCard({
  title,
  value,
  icon,
  color = 'cyan',
  suffix = '',
  decimals = 0,
  subtitle,
}: Props) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`glass rounded-2xl p-4 border ${c.border} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-ocean-200/70 font-medium truncate">{title}</p>
          <p className={`mt-1 font-display font-bold text-2xl ${c.text}`}>
            <AnimatedCounter end={value} suffix={suffix} decimals={decimals} />
          </p>
          {subtitle && <p className="text-[10px] text-ocean-200/60 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text} shrink-0`}>
          {icon}
        </div>
      </div>
      {/* corner accent */}
      <div className={`absolute -bottom-8 -right-8 h-20 w-20 rounded-full ${c.bg} blur-2xl opacity-50`} />
    </motion.div>
  );
}
