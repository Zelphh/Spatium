import { useEffect, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Square } from "lucide-react";
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
import { categoryTint } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";

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
    return <div className="h-screen w-screen" />;
  }

  if (activeSession) {
    const category = categories.find((c) => Number(c.id) === activeSession.category_id);
    const Icon = getCategoryIcon(category?.icon);
    const color = category?.color ?? "#94a3b8";

    return (
      <div className="h-screen w-screen flex flex-col gap-4 p-5 select-none">
        <div>
          <div className="eyebrow">{MODE_LABELS[activeSession.mode] ?? activeSession.mode}</div>
          <h1 className="h h2">Timer em andamento</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span
            className="grid place-items-center"
            style={{ width: 56, height: 56, borderRadius: "50% 44% 52% 48%", ...categoryTint(color), color }}
          >
            <Icon size={24} strokeWidth={1.8} />
          </span>
          <span className="chip">
            <span className="dot" style={{ background: color }} />
            {category?.name ?? "Sem categoria"}
          </span>
          <p className="h tabular m-0" style={{ fontSize: 48, letterSpacing: "-0.04em" }}>
            {formatDuration(elapsed)}
          </p>
          {activeSession.is_paused && <p className="mut m-0 text-sm font-semibold">Pausado</p>}

          <button type="button" className="btn ghost mt-1" onClick={handleStop} disabled={stopping}>
            <Square size={14} fill="currentColor" strokeWidth={0} />
            {stopping ? "Parando..." : "Parar"}
          </button>
        </div>

        {error && <p className="m-0 text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col gap-4 p-5 select-none">
      <div className="flex items-center gap-3">
        <BrandMark size={36} />
        <div>
          <h1 className="h h2">Início Rápido</h1>
          <p className="mut m-0 text-[13px]">Escolha uma categoria para iniciar</p>
        </div>
      </div>

      <div className="list flex-1 overflow-y-auto">
        <button
          type="button"
          className="item text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleStart(null)}
          disabled={loadingId !== null}
        >
          <span className="dot" style={{ background: "#94a3b8", width: 14, height: 14 }} />
          <span className="grow t mut">{loadingId === "none" ? "Iniciando..." : "Sem categoria"}</span>
        </button>

        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const id = Number(category.id);
          return (
            <button
              key={category.id}
              type="button"
              className="item text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: "var(--ink)" }}
              onClick={() => handleStart(id)}
              disabled={loadingId !== null}
            >
              <span className="dot" style={{ background: category.color, width: 14, height: 14 }} />
              <span className="grow t">{loadingId === id ? "Iniciando..." : category.name}</span>
              <Icon size={18} strokeWidth={1.8} style={{ color: category.color }} />
            </button>
          );
        })}
      </div>

      {error && <p className="m-0 text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}
