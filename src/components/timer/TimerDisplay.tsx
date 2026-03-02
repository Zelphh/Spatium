import { motion } from 'framer-motion';

interface TimerDisplayProps {
  formattedTime: string;
  isRunning: boolean;
  progress: number | null;
}

export function TimerDisplay({ formattedTime, isRunning, progress }: TimerDisplayProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Progress ring for countdown modes */}
      {progress !== null && (
        <svg className="absolute w-64 h-64 -rotate-90 opacity-60" viewBox="0 0 256 256">
          <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <motion.circle
            cx="128" cy="128" r="120"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={754}
            initial={{ strokeDashoffset: 754 }}
            animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
      )}

      {/* Timer text */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={isRunning ? { scale: [1, 1.005, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: 'easeInOut' }}
      >
        <span className="timer-display text-7xl font-bold text-primary timer-glow">
          {formattedTime}
        </span>
        {isRunning && (
          <motion.span
            className="mt-3 text-xs font-medium text-muted-foreground uppercase tracking-widest"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Em andamento
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
