import { motion } from "framer-motion";
import { TimerMode, Category, CategoryType } from "@/pages/type";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { categoryIcons, categoryColorClasses } from "@/components/timer/CategorySelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TimerCardProps {
  mode: TimerMode;
  customDuration: number;
  onCustomDurationChange: (duration: number) => void;
  isRunning: boolean;
  formattedTime: string;
  progress: number | null;
  onToggle: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  canStart: boolean;
  taskDescription: string;
  onTaskDescriptionChange: (value: string) => void;
  selectedCategory: Category | null;
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
  onStop,
  canStart,
  taskDescription,
  onTaskDescriptionChange,
  selectedCategory,
}: TimerCardProps) {
  const CategoryIcon = selectedCategory
    ? categoryIcons[selectedCategory.type as CategoryType]
    : null;
  const categoryColor = selectedCategory
    ? categoryColorClasses[selectedCategory.type as CategoryType]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="border-border/60">
        <CardContent className="p-4 pb-5 flex flex-col items-center gap-6">
          {/* Description input row */}
          <div className="flex items-center gap-2 w-full">
            {selectedCategory && CategoryIcon && (
              <span
                className={`flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-full text-primary-foreground whitespace-nowrap ${categoryColor}`}
              >
                <CategoryIcon size={12} />
                {selectedCategory.name}
              </span>
            )}
            <Input
              placeholder="No que você está trabalhando?"
              value={taskDescription}
              onChange={(e) => onTaskDescriptionChange(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60 px-0 h-8"
            />
          </div>

          <Separator className="w-full" />

          {mode === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-3"
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
            onStop={onStop}
            canStart={canStart}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
