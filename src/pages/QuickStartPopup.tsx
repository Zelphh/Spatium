import { useEffect, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Tag } from "lucide-react";
import { getCategories, createTimer } from "@/lib/timer";
import { getCategoryIcon } from "@/components/timer/CategorySelector";
import type { Category } from "@/pages/type";
import { cn } from "@/lib/utils";

export default function QuickStartPopup() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingId, setLoadingId] = useState<number | "none" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => setError(String(e)));
  }, []);

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
