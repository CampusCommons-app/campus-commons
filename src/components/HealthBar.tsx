import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface HealthBarProps {
  score: number; // 0-100, a static/computed display value (not a content field)
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SEGMENTS = 10;

export function getSegmentColor(index: number): string {
  const ratio = index / SEGMENTS;
  if (ratio < 0.4) return 'hsl(var(--destructive))';
  if (ratio < 0.65) return 'hsl(var(--accent))';
  return '#22c55e';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return 'hsl(var(--accent))';
  return 'hsl(var(--destructive))';
}

export default function HealthBar({ score, size = 'md', showLabel = true }: HealthBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const filledSegments = Math.round((score / 100) * SEGMENTS);

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
  const gaps = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1' };

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className={`flex ${gaps[size]}`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-sm ${heights[size]}`}
            style={{ background: i < filledSegments ? getSegmentColor(i) : 'hsl(var(--border))' }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={inView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.25, delay: inView ? i * 0.04 : 0, ease: 'easeOut' as const }}
          />
        ))}
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Health Score</span>
          <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>
            {score}/100
          </span>
        </div>
      )}
    </div>
  );
}
