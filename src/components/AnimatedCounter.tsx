import { useEffect, useRef, useState } from 'react';

type Props = {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

// Lightweight animated counter that eases from 0 to `end` over `duration` ms.
export default function AnimatedCounter({
  end,
  duration = 1200,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: Props) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
