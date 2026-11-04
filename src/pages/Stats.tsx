import { useState, useEffect, useMemo } from "react";
import { getDashboardChart, ChartData } from "@/lib/dashboard";

type Period = "day" | "week" | "month";

function toISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getDateForPeriod(period: Period): string {
  const now = new Date();
  if (period === "day") return now.toISOString().split("T")[0];
  if (period === "week") return toISOWeek(now);
  return now.toISOString().slice(0, 7);
}

function formatTotal(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

const Stats = () => {
  const [period, setPeriod] = useState<Period>("week");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    void getDashboardChart(period, getDateForPeriod(period))
      .then((data) => {
        if (!mounted) return;
        setChartData(data);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period]);

  const categories = useMemo(
    () =>
      (chartData?.series ?? []).map((s) => ({
        name: s.name,
        color: s.color,
        minutes: s.data.reduce((sum, v) => sum + v, 0),
      })),
    [chartData]
  );

  const totalMinutes = useMemo(
    () => categories.reduce((sum, c) => sum + c.minutes, 0),
    [categories]
  );

  const maxMinutes = Math.max(...categories.map((c) => c.minutes), 1);

  return (
    <section className="screen" aria-label="Estatísticas">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h h1">Estatísticas</h1>
        <div className="seg" role="group" aria-label="Período">
          {(["day", "week", "month"] as Period[]).map((p) => (
            <button key={p} type="button" className={period === p ? "on" : ""} onClick={() => setPeriod(p)}>
              {p === "day" ? "Dia" : p === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      <div className="two" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
        <div className="card metric" style={{ alignSelf: "start" }}>
          <div className="bubble" aria-hidden="true" />
          <div className="eyebrow">Tempo total foco</div>
          <div
            className={`v transition-opacity ${isLoading ? "opacity-40 animate-pulse" : "opacity-100"}`}
            style={{ fontSize: 52 }}
          >
            {formatTotal(totalMinutes)}
          </div>
        </div>

        <div className="card alt">
          <h2 className="h h2" style={{ marginBottom: 18 }}>
            Por categoria
          </h2>
          {isLoading && categories.length === 0 ? (
            <div className="list animate-pulse" style={{ gap: 18 }}>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="mb-2 h-4 w-24 rounded-full" style={{ background: "var(--surf2)" }} />
                  <div className="bar" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p style={{ textAlign: "center", margin: 0, padding: "24px 0", color: "var(--danger)" }}>{error}</p>
          ) : categories.length === 0 ? (
            <p className="mut" style={{ textAlign: "center", margin: 0, padding: "40px 0" }}>
              Nenhum dado disponível para este período
            </p>
          ) : (
            <div className="list" style={{ gap: 18 }}>
              {categories.map((cat) => (
                <div key={cat.name}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                    <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span className="dot" style={{ background: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="mut" style={{ fontWeight: 600 }}>
                      {(cat.minutes / 60).toFixed(1).replace(".", ",")}h
                    </span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${(cat.minutes / maxMinutes) * 100}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Stats;
