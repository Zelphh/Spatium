import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getStatsData, type StatsData, type StatsPeriod } from "@/lib/stats";
import { formatMinutes } from "@/lib/format";
import { formatGoalHours, useFocusGoal } from "@/hooks/useFocusGoal";

const pad2 = (n: number) => String(n).padStart(2, "0");

const PERIODS: { id: StatsPeriod; label: string; vs: string }[] = [
  { id: "day", label: "Dia", vs: "vs. ontem" },
  { id: "week", label: "Semana", vs: "vs. semana passada" },
  { id: "month", label: "Mês", vs: "vs. mês passado" },
];

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const GOAL_CIRCUMFERENCE = 377; // 2π·60

function toISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad2(week)}`;
}

/** Data de referência no horário local (o backend agrega em horário local). */
function getDateForPeriod(period: StatsPeriod): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  if (period === "day") return `${month}-${pad2(now.getDate())}`;
  if (period === "week") return toISOWeek(now);
  return month;
}

/** 4500 → "1h 15min" (sempre com horas, como no card principal). */
function formatTotal(secs: number) {
  const minutes = Math.round(secs / 60);
  return `${Math.floor(minutes / 60)}h ${pad2(minutes % 60)}min`;
}

const formatSecs = (secs: number) => formatMinutes(secs / 60);
const formatHoursShort = (secs: number) => `${(secs / 3600).toFixed(1).replace(".", ",")}h`;

/** Variação percentual em relação ao período anterior. */
function formatDelta(current: number, previous: number): string | null {
  if (previous <= 0) return current > 0 ? "novo" : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `↑ +${pct}%` : `↓ −${Math.abs(pct)}%`;
}

const f1 = (n: number) => n.toFixed(1);

/** Curva suave (Catmull-Rom → Bézier) passando pelos pontos. */
function smooth(pts: [number, number][]): string {
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i];
    const b = pts[i];
    const c = pts[i + 1];
    const e = pts[i + 2] ?? c;
    d += ` C${f1(b[0] + (c[0] - a[0]) / 6)},${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)},${f1(
      c[1] - (e[1] - b[1]) / 6
    )} ${f1(c[0])},${f1(c[1])}`;
  }
  return d;
}

function buildSparkline(values: number[]) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? 280 / (values.length - 1) : 0;
  const pts = values.map((v, i) => [10 + i * step, 78 - (v / max) * 62] as [number, number]);
  const line = smooth(pts);
  return { line, area: `${line} L290,86 L10,86 Z` };
}

/** Recorta as horas exibidas no mapa de calor: no mínimo 8h–19h, expandindo se houver foco fora disso. */
function heatHours(heatmap: number[][]): number[] {
  let first = 8;
  let last = 19;
  for (const row of heatmap) {
    row.forEach((v, h) => {
      if (v > 0) {
        first = Math.min(first, h);
        last = Math.max(last, h);
      }
    });
  }
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

const Skeleton = ({ height = 16, width = "100%" }: { height?: number; width?: number | string }) => (
  <div className="animate-pulse rounded-full" style={{ height, width, background: "var(--surf2)" }} />
);

const Stats = () => {
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { goal } = useFocusGoal();

  const { data, isLoading, isFetching, error } = useQuery<StatsData>({
    queryKey: ["stats", period, getDateForPeriod(period)],
    queryFn: () => getStatsData(period, getDateForPeriod(period)),
    placeholderData: keepPreviousData,
  });

  const periodInfo = PERIODS.find((p) => p.id === period)!;
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const totalSecs = data?.total_secs ?? 0;
  const maxCategorySecs = Math.max(1, ...categories.map((c) => c.total_secs));

  const selected = categories.find((c) => c.name === selectedCategory) ?? categories[0];
  const sparkline = selected ? buildSparkline(selected.evolution) : null;

  const totalDelta = data ? formatDelta(data.total_secs, data.prev_total_secs) : null;

  const goalHours = goal * (data?.period_days ?? 1);
  const goalPct = Math.round((totalSecs / 3600 / goalHours) * 100);
  const goalDash = `${f1((Math.min(goalPct, 100) / 100) * GOAL_CIRCUMFERENCE)} ${GOAL_CIRCUMFERENCE}`;

  const donut = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.total_secs, 0);
    if (total <= 0) return [];
    let acc = 0;
    return categories
      .filter((c) => c.total_secs > 0)
      .map((c) => {
        const pct = (c.total_secs / total) * 100;
        const gap = Math.max(pct - 1.4, 0.1);
        const seg = { name: c.name, color: c.color, dash: `${f1(gap)} ${f1(100 - gap)}`, offset: f1(25 - acc) };
        acc += pct;
        return seg;
      });
  }, [categories]);

  const distribution = data?.distribution ?? { short: 0, medium: 0, long: 0 };
  const distMax = Math.max(1, distribution.short, distribution.medium, distribution.long);
  const distRows = [
    { label: "Menos de 25 min", n: distribution.short },
    { label: "25 a 60 min", n: distribution.medium },
    { label: "Mais de 60 min", n: distribution.long },
  ];

  const heatmap = data?.heatmap ?? Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  const hours = heatHours(heatmap);
  const heatMax = Math.max(1, ...heatmap.flat());

  const dim = isFetching ? "opacity-60" : "opacity-100";
  const showSkeleton = isLoading && !data;

  return (
    <section className="screen" aria-label="Estatísticas">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="h h1">Estatísticas</h1>
        <div className="seg" role="group" aria-label="Período">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" className={period === p.id ? "on" : ""} onClick={() => setPeriod(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="card">
          <p style={{ textAlign: "center", margin: 0, padding: "24px 0", color: "var(--danger)" }}>{String(error)}</p>
        </div>
      ) : null}

      <div className="two" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card metric">
            <div className="bubble" aria-hidden="true" />
            <div className="eyebrow">Tempo total foco</div>
            <div className={`v transition-opacity ${dim}`} style={{ fontSize: 52 }}>
              {formatTotal(totalSecs)}
            </div>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <span className="delta">{totalDelta ?? "—"}</span>
              <span className="mut" style={{ fontSize: 14 }}>
                {totalDelta ? periodInfo.vs : "sem dados no período anterior"}
              </span>
            </div>
          </div>

          <div className="card alt row" style={{ flexWrap: "nowrap", gap: 20 }}>
            <div
              style={{ position: "relative", width: 128, height: 128, flex: "none", display: "grid", placeItems: "center" }}
              role="img"
              aria-label={`Meta atingida: ${goalPct}%`}
            >
              <svg viewBox="0 0 140 140" width="128" height="128" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="stats-goal-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" style={{ stopColor: "var(--ac)" }} />
                    <stop offset="1" style={{ stopColor: "var(--ac2)" }} />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--line)" strokeWidth="12" />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="url(#stats-goal-gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={goalDash}
                  style={{ transition: "stroke-dasharray .6s cubic-bezier(.2,.8,.2,1)" }}
                />
              </svg>
              <b className="h" style={{ position: "absolute", fontSize: 26 }}>
                {goalPct}%
              </b>
            </div>
            <div>
              <div className="eyebrow">Meta de foco</div>
              <div className="h h2" style={{ marginTop: 6 }}>
                de {formatGoalHours(goalHours)}
              </div>
              <div className="mut" style={{ fontSize: 14, marginTop: 4 }}>
                Ajuste em Configurações
              </div>
            </div>
          </div>
        </div>

        <div className="card alt">
          <h2 className="h h2" style={{ marginBottom: 18 }}>
            Por categoria
          </h2>
          {showSkeleton ? (
            <div className="list" style={{ gap: 18 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton width={96} />
                  <Skeleton />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="mut" style={{ textAlign: "center", margin: 0, padding: "40px 0" }}>
              Nenhum dado disponível para este período
            </p>
          ) : (
            <div className={`list transition-opacity ${dim}`} style={{ gap: 6 }}>
              {categories.map((cat) => {
                const isSel = cat.name === selected?.name;
                const delta = formatDelta(cat.total_secs, cat.prev_total_secs);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`rowbtn${isSel ? " sel" : ""}`}
                    aria-pressed={isSel}
                    aria-label={`Ver evolução de ${cat.name}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                      <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span className="dot" style={{ background: cat.color }} />
                        {cat.name}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        {delta && (
                          <span className="mut" style={{ fontSize: 13, fontWeight: 600 }}>
                            {delta}
                          </span>
                        )}
                        <span className="mut" style={{ fontWeight: 600 }}>
                          {formatHoursShort(cat.total_secs)}
                        </span>
                      </span>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${(cat.total_secs / maxCategorySecs) * 100}%`, background: cat.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`g3 transition-opacity ${dim}`} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))" }}>
        <div className="mini-stat">
          <span className="eyebrow">Sessões</span>
          <b>{data?.session_count ?? 0}</b>
        </div>
        <div className="mini-stat">
          <span className="eyebrow">Duração média</span>
          <b>{formatSecs(data?.avg_secs ?? 0)}</b>
        </div>
        <div className="mini-stat">
          <span className="eyebrow">Sessão mais longa</span>
          <b>{formatSecs(data?.longest_secs ?? 0)}</b>
        </div>
        <div className="mini-stat">
          <span className="eyebrow">{data?.best_label ?? "Melhor dia"}</span>
          <b>{data?.best_value ?? "—"}</b>
        </div>
        <div className="mini-stat">
          <span className="eyebrow">Sequência de foco</span>
          <b>
            {data?.streak_days ?? 0} {data?.streak_days === 1 ? "dia" : "dias"}
          </b>
        </div>
      </div>

      <div className="two" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <h2 className="h h2" style={{ alignSelf: "flex-start" }}>
            Peso de cada categoria
          </h2>
          <div
            style={{ position: "relative", width: "min(220px, 100%)", aspectRatio: "1", display: "grid", placeItems: "center" }}
            role="img"
            aria-label={`Rosca com a proporção de tempo por categoria: ${donut.map((d) => d.name).join(", ") || "sem dados"}`}
          >
            <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden="true">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--line)" strokeWidth="5" />
              {donut.map((d) => (
                <circle
                  key={d.name}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={d.dash}
                  strokeDashoffset={d.offset}
                >
                  <title>{d.name}</title>
                </circle>
              ))}
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <b className="h" style={{ fontSize: 34 }}>
                {Math.round(totalSecs / 3600)}h
              </b>
              <div className="mut" style={{ fontSize: 13, fontWeight: 600 }}>
                no período
              </div>
            </div>
          </div>
        </div>

        <div className="card alt">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <h2 className="h h2">Evolução</h2>
            {selected && (
              <span className="chip">
                <span className="dot" style={{ background: selected.color }} />
                {selected.name}
              </span>
            )}
          </div>
          {sparkline && selected ? (
            <>
              <svg
                viewBox="0 0 300 96"
                style={{ width: "100%", height: "auto", display: "block" }}
                role="img"
                aria-label={`Evolução do tempo em ${selected.name}`}
              >
                <path d={sparkline.area} fill={selected.color} fillOpacity=".25" />
                <path d={sparkline.line} fill="none" stroke={selected.color} strokeWidth="3" strokeLinecap="round" />
              </svg>
              {data && data.evolution_labels.length > 0 && (
                <div className="row mut" style={{ justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                  <span>{data.evolution_labels[0]}</span>
                  <span>{data.evolution_labels[data.evolution_labels.length - 1]}</span>
                </div>
              )}
              <p className="mut" style={{ fontSize: 13, margin: "8px 0 0" }}>
                Toque em uma categoria acima para ver a evolução dela.
              </p>
            </>
          ) : (
            <p className="mut" style={{ fontSize: 14, margin: 0, padding: "24px 0", textAlign: "center" }}>
              {showSkeleton ? "Carregando…" : "Sem dados para mostrar a evolução"}
            </p>
          )}

          <h3 className="h" style={{ fontSize: 18, margin: "22px 0 12px" }}>
            Distribuição por duração
          </h3>
          <div className="list" style={{ gap: 12 }}>
            {distRows.map((x) => (
              <div key={x.label}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{x.label}</span>
                  <span className="mut" style={{ fontSize: 14, fontWeight: 600 }}>
                    {x.n}
                  </span>
                </div>
                <div className="bar" style={{ height: 12 }}>
                  <i style={{ width: `${(x.n / distMax) * 100}%`, background: "linear-gradient(90deg, var(--ac), var(--ac2))" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="h h2" style={{ marginBottom: 4 }}>
          Quando você rende mais
        </h2>
        <p className="mut" style={{ fontSize: 14, margin: "0 0 14px" }}>
          Quanto mais escuro, mais tempo de foco naquele horário{" "}
          {period === "month" ? "neste mês" : "nas últimas 4 semanas"}.
        </p>
        <div className="scroll" role="img" aria-label="Mapa de calor de foco por dia da semana e hora">
          <div className="heat" style={{ ["--heat-cols" as string]: hours.length }}>
            <span />
            {hours.map((h, i) => (
              <span key={h} style={{ textAlign: "center" }}>
                {i % 3 === 0 ? `${h}h` : ""}
              </span>
            ))}
            {WEEKDAYS.map((day, d) => (
              <HeatRow key={day} day={day} cells={hours.map((h) => heatmap[d]?.[h] ?? 0)} hours={hours} max={heatMax} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const HeatRow = ({ day, cells, hours, max }: { day: string; cells: number[]; hours: number[]; max: number }) => (
  <>
    <span>{day}</span>
    {cells.map((secs, i) => (
      <i
        key={hours[i]}
        style={{ background: `color-mix(in srgb, var(--ac) ${Math.round(6 + (secs / max) * 80)}%, transparent)` }}
        title={`${day} ${hours[i]}h · ${formatSecs(secs)}`}
      />
    ))}
  </>
);

export default Stats;
