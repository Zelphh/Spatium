import { Button } from "@/components/ui/button";

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

const PERIOD_LABELS: Record<Period, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
};

const INPUT_TYPES: Record<Period, string> = {
  day: "date",
  week: "week",
  month: "month",
};

interface ChartPeriodPickerProps {
  period: Period;
  date: string;
  onChange: (period: Period, date: string) => void;
}

export function ChartPeriodPicker({ period, date, onChange }: ChartPeriodPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type={INPUT_TYPES[period]}
        value={date}
        onChange={(e) => onChange(period, e.target.value)}
        className="h-7 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {(["day", "week", "month"] as Period[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p ? "default" : "ghost"}
            className="h-7 px-3 text-xs rounded-md"
            onClick={() => onChange(p, getDefaultDate(p))}
          >
            {PERIOD_LABELS[p]}
          </Button>
        ))}
      </div>
    </div>
  );
}
