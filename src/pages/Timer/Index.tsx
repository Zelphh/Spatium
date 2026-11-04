import { useState } from "react";
import { TimerOrb, MODE_LABELS } from "@/components/timer/TimerOrb";
import { TimerControls } from "@/components/timer/TimerControls";
import { CategoryChip } from "@/components/timer/CategoryChip";
import { CategorySelector } from "@/components/timer/CategorySelector";
import { CreateCategoryDialog } from "@/components/timer/CreateCategoryDialog";
import { DeleteCategoryDialog } from "@/components/timer/DeleteCategoryDialog";
import { useTimer } from "@/hooks/useTimer";
import { useSession } from "@/contexts/SessionContext";
import { TimerMode, Category } from "@/pages/type";

const MODES: TimerMode[] = ["standard", "pomodoro", "custom"];

const Index = () => {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const timer = useTimer();
  const session = useSession();

  const handleModeChange = (newMode: TimerMode) => {
    if (!timer.isRunning) {
      timer.setMode(newMode);
      timer.reset({ recordEvent: false });
    }
  };

  return (
    <section className="screen" aria-label="Timer">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h h1">Timer</h1>
        <div className="seg" role="group" aria-label="Modo do timer">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={timer.mode === mode ? "on" : ""}
              disabled={timer.isRunning}
              onClick={() => handleModeChange(mode)}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className="two" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
          <div className="row" style={{ width: "100%", flexWrap: "nowrap" }}>
            <input
              className="input"
              type="text"
              placeholder="Sobre o que é essa sessão?"
              aria-label="Descrição da sessão"
              value={session.taskDescription}
              onChange={(e) => session.setTaskDescription(e.target.value)}
            />
            <CategoryChip category={session.selectedCategory} />
          </div>

          <TimerOrb style={{ width: "min(300px, 100%)", aspectRatio: "1" }} />

          {timer.mode === "custom" && (
            <label className="lab" style={{ width: 140 }}>
              Duração (min)
              <input
                className="input"
                type="number"
                min={1}
                max={180}
                value={timer.customDuration}
                disabled={timer.isRunning}
                onChange={(e) => timer.setCustomDuration(Number(e.target.value))}
              />
            </label>
          )}

          <TimerControls
            isRunning={timer.isRunning}
            onToggle={session.toggleTimer}
            onReset={session.finishSession}
            onStop={session.finishSession}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card alt">
            <h2 className="h h2" style={{ marginBottom: 14 }}>
              Categoria
            </h2>
            <CategorySelector
              categories={session.categories}
              selectedCategory={session.selectedCategory}
              onCategoryChange={session.selectCategory}
              onAddCategory={() => setAddCategoryOpen(true)}
              onEditCategory={setEditingCategory}
              onDeleteCategory={setDeletingCategory}
            />
          </div>

          <div className="card" style={{ flex: 1 }}>
            <label className="lab" style={{ height: "100%" }}>
              <span className="h h2" style={{ color: "var(--ink)" }}>
                Notas
              </span>
              <textarea
                className="input"
                style={{ flex: 1, minHeight: 150 }}
                placeholder="Adicione suas notas sobre essa sessão..."
                value={session.notes}
                onChange={(e) => session.setNotes(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <CreateCategoryDialog
        open={addCategoryOpen || editingCategory !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddCategoryOpen(false);
            setEditingCategory(null);
          } else {
            setAddCategoryOpen(true);
          }
        }}
        editCategory={editingCategory}
        onCreated={(category) => {
          session.setCategories((prev) => [...prev, category]);
          session.selectCategory(category);
        }}
        onUpdated={(updated) => {
          session.setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        onDeleted={(deleted) => {
          session.setCategories((prev) => prev.filter((c) => c.id !== deleted.id));
        }}
      />
    </section>
  );
};

export default Index;
