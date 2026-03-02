import { motion } from 'framer-motion';
import { TimerMode } from '@/types/timer';
import { Clock, Timer, Settings2 } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

const modes: { id: TimerMode; label: string; icon: typeof Clock }[] = [
  { id: 'standard', label: 'Padrão', icon: Clock },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'custom', label: 'Personalizado', icon: Settings2 },
];

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;

        return (
          <motion.button
            key={mode.id}
            onClick={() => !disabled && onModeChange(mode.id)}
            disabled={disabled}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium 
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
            `}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
          >
            {isSelected && (
              <motion.div
                layoutId="mode-bg"
                className="absolute inset-0 bg-primary rounded-md"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={16} />
              {mode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
