import { Bot } from 'lucide-react';

type Props = {
  size?: number;
  showText?: boolean;
  textClassName?: string;
};

// Robo Web Sprint logo - radar bot emblem.
export default function Logo({ size = 40, showText = true, textClassName = '' }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-xl cyber-btn"
        style={{ width: size, height: size }}
      >
        <Bot size={size * 0.55} className="text-cyber-cyan" />
        <span className="absolute inset-0 rounded-xl animate-glow-pulse pointer-events-none" />
      </div>
      {showText && (
        <div className={`flex flex-col ${textClassName}`}>
          <span className="font-display font-bold text-cyber-cyan neon-text leading-tight tracking-wider" style={{ fontSize: size * 0.32 }}>
            ROBO WEB SPRINT
          </span>
          <span className="text-[10px] text-ocean-200/70 uppercase tracking-[0.25em]">
            AI Disaster Response
          </span>
        </div>
      )}
    </div>
  );
}
