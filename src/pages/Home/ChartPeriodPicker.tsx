import { useTheme } from "next-themes";

export type Period = "day" | "week" | "month";

function toISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getDefaultDate(period: Period): string {
  const now = new Date();
  if (period === "day") return now.toISOString().split("T")[0];
  if (period === "week") return toISOWeek(now);
  return now.toISOString().slice(0, 7);
}

export const PERIOD_LABELS: Record<Period, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
};

const INPUT_TYPES: Record<Period, string> = {
  day: "date",
  week: "week",
  month: "month",
};

const INPUT_LABELS: Record<Period, string> = {
  day: "Data de referência",
  week: "Semana de referência",
  month: "Mês de referência",
};

interface ChartPeriodPickerProps {
  period: Period;
  date: string;
  onChange: (period: Period, date: string) => void;
}

export function ChartPeriodPicker({ period, date, onChange }: ChartPeriodPickerProps) {
  const { theme } = useTheme();

  return (
    <div className="row">
      <div className="seg" role="group" aria-label="Período do gráfico">
        {(["day", "week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            className={period === p ? "on" : ""}
            onClick={() => onChange(p, getDefaultDate(p))}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
      <input
        className="input"
        type={INPUT_TYPES[period]}
        aria-label={INPUT_LABELS[period]}
        value={date}
        onChange={(e) => onChange(period, e.target.value)}
        style={{ width: "auto", colorScheme: theme === "light" ? "light" : "dark" }}
      />
    </div>
  );
}
