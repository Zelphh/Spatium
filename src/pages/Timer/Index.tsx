import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { notify } from "@/components/notificationManager";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { TimerCard } from "@/pages/Timer/TimerCard";
import { CategorySelectorCard } from "@/pages/Timer/CategorySelectorCard";
import { TaskDescriptionCard } from "@/pages/Timer/TaskDescriptionCard";
import { CreateCategoryDialog } from "@/components/timer/CreateCategoryDialog";
import { useTimer } from "@/hooks/useTimer";
import { TimerMode, Category } from "@/pages/type";
import { changeCategory, changeDescription, changeNotes, getCategories } from "@/lib/timer";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [taskDescription, setTaskDescription] = useState("");
  const [notes, setNotes] = useState("");
  const hasNotifiedCompletionRef = useRef(false);
  const cancelNotificationRef = useRef(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const timer = useTimer();

  useEffect(() => {
    if (timer.mode !== "custom" || !timer.isCompleted) {
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
  }, [timer.mode, timer.isCompleted]);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  const handleReset = useCallback(() => {
    cancelNotificationRef.current = true;
    if (timer.sessionId !== null && timer.sessionId > 0) {
      changeNotes({
        session_id: timer.sessionId,
        notes,
      });
      changeDescription({
        session_id: timer.sessionId,
        description: taskDescription,
      });
    }
    timer.reset();
    setTaskDescription("");
    setSelectedCategory(null);
    setNotes("");
  }, [timer, notes, taskDescription]);

  const handleModeChange = (newMode: TimerMode) => {
    if (!timer.isRunning) {
      timer.setMode(newMode);
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
          selectedMode={timer.mode}
          onModeChange={handleModeChange}
          disabled={timer.isRunning}
        />
      </motion.div>

      {/* Timer Card with description input */}
      <TimerCard
        mode={timer.mode}
        customDuration={timer.customDuration}
        onCustomDurationChange={timer.setCustomDuration}
        isRunning={timer.isRunning}
        formattedTime={timer.formattedTime}
        progress={timer.progress}
        onToggle={() => timer.toggle(taskDescription, selectedCategory?.id ? Number(selectedCategory.id) : null)}
        onReset={handleReset}
        onStop={handleReset}
        canStart={true}
        taskDescription={taskDescription}
        onTaskDescriptionChange={setTaskDescription}
        selectedCategory={selectedCategory}
      />

      {/* Category Selection Card */}
      <CategorySelectorCard
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onAddCategory={() => setAddCategoryOpen(true)}
        disabled={false}
      />

      <CreateCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onCreated={(category) => {
          setCategories((prev) => [...prev, category]);
          setSelectedCategory(category);
        }}
      />

      {/* Notes Card */}
      <TaskDescriptionCard
        notes={notes}
        onNotesChange={setNotes}
        disabled={false}
      />
    </div>
  );
};

export default Index;
