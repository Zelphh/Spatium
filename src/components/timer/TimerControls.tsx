import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  canStart: boolean;
}

export function TimerControls({
  isRunning,
  onToggle,
  onReset,
  canStart,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Reset button */}
      <motion.div whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="w-12 h-12 rounded-full border-border"
        >
          <RotateCcw size={18} />
        </Button>
      </motion.div>

      {/* Main play/pause button */}
      <motion.div
        whileHover={canStart ? { scale: 0.95 } : undefined}
        whileTap={canStart ? { scale: 0.95 } : undefined}
      >
        <Button
          onClick={onToggle}
          disabled={!canStart}
          className="gradient-primary text-white h-11 px-8 rounded-xl text-sm font-semibold
            shadow-lg shadow-primary/30 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <motion.div
            key={isRunning ? "pause" : "play"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
          </motion.div>
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
      </motion.div>
    </div>
  );
}
