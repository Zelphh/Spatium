import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { type SessionListItem } from "@/lib/dashboard";
import { getCategories } from "@/lib/timer";
import { getHistoryData } from "@/lib/history";
import { formatSecondsShort, formatSessionWhen, sessionTitle } from "@/lib/format";
import { cn, categoryTint } from "@/lib/utils";
import { type Category } from "@/pages/type";

type SortOrder = "desc" | "asc";

const History = () => {
  const { theme } = useTheme();
  const colorScheme = theme === "light" ? "light" : "dark";
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    void Promise.all([getHistoryData(), getCategories()])
      .then(([historyResponse, cats]) => {
        if (!mounted) return;
        setSessions(historyResponse.sessions);
        setCategories(cats);
        setError(null);
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(String(fetchError));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    if (startDate) {
      list = list.filter((s) => s.created_at.slice(0, 10) >= startDate);
    }
    if (endDate) {
      list = list.filter((s) => s.created_at.slice(0, 10) <= endDate);
    }
    if (selectedCategories.length > 0) {
      list = list.filter((s) => selectedCategories.includes(s.category));
    }

    list.sort((a, b) => {
      const diff =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "desc" ? diff : -diff;
    });

    return list;
  }, [sessions, startDate, endDate, selectedCategories, sortOrder]);

  const totalSeconds = useMemo(
    () => filteredSessions.reduce((acc, s) => acc + s.duration_secs, 0),
    [filteredSessions],
  );

  const hasDateFilter = startDate !== "" || endDate !== "";
  const hasActiveFilter =
    hasDateFilter || selectedCategories.length > 0;

  return (
    <section className="screen" aria-label="Histórico">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h h1">Histórico</h1>
        <span className="chip" style={{ fontSize: 15 }}>
          Total filtrado · <b>{formatSecondsShort(totalSeconds)}</b>
        </span>
      </div>

      <div className="card alt" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <label className="lab">
            De
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "auto", colorScheme }}
            />
          </label>
          <label className="lab">
            Até
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: "auto", colorScheme }}
            />
          </label>
          {hasActiveFilter && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedCategories([]);
              }}
            >
              Limpar filtros
            </button>
          )}
          <div className="seg" role="group" aria-label="Ordenação" style={{ marginLeft: "auto" }}>
            <button type="button" className={sortOrder === "desc" ? "on" : ""} onClick={() => setSortOrder("desc")}>
              Mais recente
            </button>
            <button type="button" className={sortOrder === "asc" ? "on" : ""} onClick={() => setSortOrder("asc")}>
              Mais antigo
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="row" style={{ gap: 8 }} role="group" aria-label="Filtrar por categoria">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={cn("chip", active && "sel")}
                  style={categoryTint(cat.color)}
                  aria-pressed={active}
                  onClick={() => toggleCategory(cat.name)}
                >
                  <span className="dot" style={{ background: cat.color }} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="list">
        {isLoading ? (
          <p className="mut" style={{ textAlign: "center", padding: "48px 0", margin: 0 }}>
            Carregando histórico...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", padding: "48px 0", margin: 0, color: "var(--danger)" }}>{error}</p>
        ) : filteredSessions.length === 0 ? (
          <p className="mut" style={{ textAlign: "center", padding: "48px 0", margin: 0 }}>
            {hasActiveFilter
              ? "Nenhuma sessão encontrada com esses filtros"
              : "Nenhuma entrada de tempo registrada. As sessões aparecem aqui quando você completa um timer."}
          </p>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="item" style={{ flexWrap: "wrap" }}>
              <span className="dot" style={{ background: session.category_color, width: 14, height: 14 }} />
              <div className="grow" style={{ minWidth: 180 }}>
                <div className="t" style={{ whiteSpace: "normal" }}>
                  {sessionTitle(session.description)}
                </div>
                <div className="s">{formatSessionWhen(session.created_at, true)}</div>
              </div>
              <span className="badge" style={categoryTint(session.category_color)}>
                <span className="dot" style={{ background: session.category_color }} />
                {session.category}
              </span>
              <b style={{ whiteSpace: "nowrap", minWidth: 72, textAlign: "right" }}>
                {formatSecondsShort(session.duration_secs)}
              </b>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default History;
