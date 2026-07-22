import { useEffect, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Tag, Square } from "lucide-react";
import {
  getCategories,
  createTimer,
  getActiveTimerSession,
  addEventTimer,
  formatDuration,
  type ActiveTimerSession,
} from "@/lib/timer";
import { getCategoryIcon } from "@/components/timer/CategorySelector";
import type { Category } from "@/pages/type";
import { cn } from "@/lib/utils";

const MODE_LABELS: Record<string, string> = {
  standard: "Padrão",
  pomodoro: "Pomodoro",
  custom: "Personalizado",
};

export default function QuickStartPopup() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkingActive, setCheckingActive] = useState(true);
  const [activeSession, setActiveSession] = useState<ActiveTimerSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [loadingId, setLoadingId] = useState<number | "none" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    getActiveTimerSession()
      .then((session) => {
        setActiveSession(session);
        if (session) setElapsed(session.elapsed_secs);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setCheckingActive(false));
  }, []);

  useEffect(() => {
    if (!activeSession || activeSession.is_paused) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  async function handleStart(categoryId: number | null) {
    setLoadingId(categoryId ?? "none");
    setError(null);
    try {
      const response = await createTimer({
        name: "Sessão rápida",
        duration: 0,
        mode: "standard",
        ...(categoryId ? { category_id: categoryId } : {}),
      });
      await emit("timer-session-started", response.id);
      await getCurrentWindow().close();
    } catch (e) {
      setError(String(e));
      setLoadingId(null);
    }
  }

  async function handleStop() {
    if (!activeSession) return;
    setStopping(true);
    setError(null);
    try {
      await addEventTimer({ timer_id: activeSession.session_id, event: "finished" });
      await emit("timer-session-finished", activeSession.session_id);
      setActiveSession(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setStopping(false);
    }
  }

  if (checkingActive) {
    return <div className="h-screen w-screen bg-background" />;
  }

  if (activeSession) {
    const category = categories.find((c) => Number(c.id) === activeSession.category_id);
    const Icon = getCategoryIcon(category?.icon);

    return (
      <div className="h-screen w-screen flex flex-col p-4 bg-background text-foreground select-none">
        <div className="mb-2">
          <h1 className="text-sm font-semibold">Timer em andamento</h1>
          <p className="text-xs text-muted-foreground">
            {MODE_LABELS[activeSession.mode] ?? activeSession.mode}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground"
            style={{ backgroundColor: category?.color ?? "hsl(var(--muted))" }}
          >
            <Icon size={20} />
          </span>
          <p className="text-sm text-foreground">{category?.name ?? "Sem categoria"}</p>
          <p className="text-2xl timer-display text-foreground">{formatDuration(elapsed)}</p>
          {activeSession.is_paused && (
            <p className="text-xs text-muted-foreground">Pausado</p>
          )}

          <button
            onClick={handleStop}
            disabled={stopping}
            className="flex items-center gap-2 px-4 py-2 mt-2 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Square size={14} />
            {stopping ? "Parando..." : "Parar"}
          </button>
        </div>

        {error && <p className="text-xs text-destructive mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col p-4 bg-background text-foreground select-none">
      <div className="mb-3">
        <h1 className="text-sm font-semibold">Início Rápido</h1>
        <p className="text-xs text-muted-foreground">Escolha uma categoria para iniciar o timer</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
        <button
          onClick={() => handleStart(null)}
          disabled={loadingId !== null}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-left text-sm text-muted-foreground",
            "hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Tag size={13} />
          </span>
          {loadingId === "none" ? "Iniciando..." : "Sem categoria"}
        </button>

        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const id = Number(category.id);
          return (
            <button
              key={category.id}
              onClick={() => handleStart(id)}
              disabled={loadingId !== null}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-left text-sm",
                "hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <Icon size={13} />
              </span>
              {loadingId === id ? "Iniciando..." : category.name}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-destructive mt-3">{error}</p>}
    </div>
  );
}
