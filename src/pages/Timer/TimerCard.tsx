import { motion } from "framer-motion";
import { TimerMode } from "@/pages/type";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TimerCardProps {
  mode: TimerMode;
  customDuration: number;
  onCustomDurationChange: (duration: number) => void;
  isRunning: boolean;
  formattedTime: string;
  progress: number | null;
  onToggle: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
  canStart: boolean;
}

export function TimerCard({
  mode,
  customDuration,
  onCustomDurationChange,
  isRunning,
  formattedTime,
  progress,
  onToggle,
  onReset,
  canStart,
}: TimerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="border-border/60">
        <CardContent className="p-3 flex flex-col items-center gap-8 relative">
          {mode === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex w-full items-center gap-3 lg:absolute lg:left-5 lg:top-3 lg:w-auto"
            >
              <Label
                htmlFor="duration"
                className="text-muted-foreground whitespace-nowrap text-sm"
              >
                Duração (min):
              </Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={180}
                value={customDuration}
                onChange={(e) => onCustomDurationChange(Number(e.target.value))}
                disabled={isRunning}
                className="w-24 text-center"
              />
            </motion.div>
          )}

          <TimerDisplay
            mode={mode}
            formattedTime={formattedTime}
            isRunning={isRunning}
            progress={progress}
          />

          <TimerControls
            isRunning={isRunning}
            onToggle={onToggle}
            onReset={onReset}
            canStart={canStart}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
