import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { ModeSelector } from '@/components/timer/ModeSelector';
import { CategorySelector } from '@/components/timer/CategorySelector';
import { TimerControls } from '@/components/timer/TimerControls';
import { useTimer } from '@/hooks/useTimer';
import { TimerMode, Category, DEFAULT_CATEGORIES } from '@/types/timer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const [mode, setMode] = useState<TimerMode>('standard');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [customDuration, setCustomDuration] = useState(25);
  const [taskDescription, setTaskDescription] = useState('');

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

  const canStart = selectedCategory !== null;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Timer</h1>
          <p className="text-muted-foreground text-sm mt-1">Inicie uma sessão de foco</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6">
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

            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/60">
                <CardContent className="p-8 flex flex-col items-center gap-8">
                  {/* Custom Duration Input */}
                  {mode === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center gap-3 w-full"
                    >
                      <Label htmlFor="duration" className="text-muted-foreground whitespace-nowrap text-sm">
                        Duração (min):
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        max={180}
                        value={customDuration}
                        onChange={(e) => setCustomDuration(Number(e.target.value))}
                        disabled={timer.isRunning}
                        className="w-24 text-center"
                      />
                    </motion.div>
                  )}

                  <TimerDisplay
                    formattedTime={timer.formattedTime}
                    isRunning={timer.isRunning}
                    progress={timer.progress}
                  />

                  <TimerControls
                    isRunning={timer.isRunning}
                    onToggle={timer.toggle}
                    onReset={timer.reset}
                    canStart={canStart}
                  />

                  {!canStart && !timer.isRunning && (
                    <p className="text-xs text-muted-foreground">
                      Selecione uma categoria para iniciar
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Task Details */}
          <div className="space-y-4">
            {/* Task Description Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    O que você está trabalhando?
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Digite a descrição da tarefa..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    disabled={timer.isRunning}
                    className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60 min-h-[80px]"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Selector Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Categoria
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-4">
                  <CategorySelector
                    categories={DEFAULT_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    disabled={timer.isRunning}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
