import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { TimerCard } from "@/pages/Timer/TimerCard";
import { TaskDescriptionCard } from "@/pages/Timer/TaskDescriptionCard";
import { CategorySelectorCard } from "@/pages/Timer/CategorySelectorCard";
import { useTimer } from "@/hooks/useTimer";
import { TimerMode, Category, DEFAULT_CATEGORIES } from "@/pages/type";

const Index = () => {
  const [mode, setMode] = useState<TimerMode>("standard");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [customDuration, setCustomDuration] = useState(25);
  const [taskDescription, setTaskDescription] = useState("");

  const timer = useTimer({ mode, customDuration });

  const handleModeChange = (newMode: TimerMode) => {
    if (!timer.isRunning) {
      setMode(newMode);
      timer.reset();
    }
  };

  const handleCategoryChange = (category: Category) => {
    if (!timer.isRunning) {
      setSelectedCategory(category);
    }
  };

  const canStart = true;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl w-full mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Timer</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Inicie uma sessão de foco
          </p>
        </motion.div>

        <div className="mb-5">
          {/* Left Column: Timer */}
          <div className="space-y-4">
            {/* Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ModeSelector
                selectedMode={mode}
                onModeChange={handleModeChange}
                disabled={timer.isRunning}
              />
            </motion.div>

            <TimerCard
              mode={mode}
              customDuration={customDuration}
              onCustomDurationChange={setCustomDuration}
              isRunning={timer.isRunning}
              formattedTime={timer.formattedTime}
              progress={timer.progress}
              onToggle={timer.toggle}
              onReset={timer.reset}
              canStart={canStart}
            />
          </div>
        </div>

        {/* Right Column: Task Details */}
        <div className="space-y-4">
          <CategorySelectorCard
            categories={DEFAULT_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            disabled={timer.isRunning}
          />

          <TaskDescriptionCard
            taskDescription={taskDescription}
            onTaskDescriptionChange={setTaskDescription}
            disabled={timer.isRunning}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
