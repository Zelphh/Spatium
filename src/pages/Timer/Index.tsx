import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { notify } from "@/components/notificationManager";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { TimerCard } from "@/pages/Timer/TimerCard";
import { CategorySelectorCard } from "@/pages/Timer/CategorySelectorCard";
import { TaskDescriptionCard } from "@/pages/Timer/TaskDescriptionCard";
import { useTimer } from "@/hooks/useTimer";
import { TimerMode, Category, DEFAULT_CATEGORIES } from "@/pages/type";
import { changeCategory, changeDescription, changeNotes } from "@/lib/timer";

const Index = () => {
  const [mode, setMode] = useState<TimerMode>("standard");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [customDuration, setCustomDuration] = useState(25);
  const [taskDescription, setTaskDescription] = useState("");
  const [notes, setNotes] = useState("");
  const hasNotifiedCompletionRef = useRef(false);
  const cancelNotificationRef = useRef(false);

  const timer = useTimer({
    mode,
    customDuration,
    taskDescription,
    categoryId: selectedCategory?.id ? Number(selectedCategory.id) : null,
  });

  const handleReset = useCallback(() => {
    cancelNotificationRef.current = true;
    timer.reset();
  }, [timer]);

  useEffect(() => {
    if (mode !== "custom" || !timer.isCompleted) {
      hasNotifiedCompletionRef.current = false;
      cancelNotificationRef.current = false;
      return;
    }

    if (!hasNotifiedCompletionRef.current && !cancelNotificationRef.current) {
      notify({
        title: "Timer finalizado",
        message: "O tempo do modo personalizado chegou ao fim.",
        borderColor: "hsl(var(--primary))",
        duration: 4000,
      });
      hasNotifiedCompletionRef.current = true;
    }
  }, [mode, timer.isCompleted]);

  const handleModeChange = (newMode: TimerMode) => {
    if (!timer.isRunning) {
      setMode(newMode);
      timer.reset({ recordEvent: false });
    }
  };

  const handleCategoryChange = (category: Category) => {
    if (timer.sessionId !== null && timer.sessionId > 0) {
      changeCategory({
        session_id: timer.sessionId,
        category_id: Number(category.id),
      });
    }
    setSelectedCategory(category);
  };

  const handleDescriptionChange = (description: string) => {
    if (timer.sessionId !== null && timer.sessionId > 0) {
      changeDescription({
        session_id: timer.sessionId,
        description,
      });
    }
    setTaskDescription(description);
  };

  const handleNotesChange = (value: string) => {
    if (timer.sessionId !== null && timer.sessionId > 0) {
      changeNotes({
        session_id: timer.sessionId,
        notes: value,
      });
    }
    setNotes(value);
  };

  return (
    <div className="p-6 w-full mx-auto flex flex-col gap-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Timer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inicie uma sessão de foco
        </p>
      </motion.div>

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

      {/* Timer Card with description input */}
      <TimerCard
        mode={mode}
        customDuration={customDuration}
        onCustomDurationChange={setCustomDuration}
        isRunning={timer.isRunning}
        formattedTime={timer.formattedTime}
        progress={timer.progress}
        onToggle={timer.toggle}
        onReset={handleReset}
        onStop={handleReset}
        canStart={true}
        taskDescription={taskDescription}
        onTaskDescriptionChange={handleDescriptionChange}
        selectedCategory={selectedCategory}
      />

      {/* Category Selection Card */}
      <CategorySelectorCard
        categories={DEFAULT_CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onAddCategory={() => {}}
        disabled={false}
      />

      {/* Notes Card */}
      <TaskDescriptionCard
        notes={notes}
        onNotesChange={handleNotesChange}
        disabled={false}
      />
    </div>
  );
};

export default Index;
