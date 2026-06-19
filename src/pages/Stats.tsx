import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock } from "lucide-react";
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
  const m = minutes % 60;
  return `${h}h ${m}min`;
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
    <div className="p-8 max-w-5xl w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">Estatísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Veja como você está gastando seu tempo
        </p>
      </motion.div>

      {/* Period Selector */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["day", "week", "month"] as Period[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p ? "default" : "ghost"}
            className="h-8 px-4 text-xs rounded-md"
            onClick={() => setPeriod(p)}
          >
            {p === "day" ? "Dia" : p === "week" ? "Semana" : "Mês"}
          </Button>
        ))}
      </div>

      {/* Total Time Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">
                Tempo total foco
              </span>
            </div>
            <p
              className={`timer-display text-5xl font-bold text-primary timer-glow transition-opacity ${
                isLoading ? "opacity-40 animate-pulse" : "opacity-100"
              }`}
            >
              {formatTotal(totalMinutes)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Por categoria
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-muted/30 rounded-xl animate-pulse"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="w-20 h-4 rounded bg-muted" />
                    </div>
                    <div className="w-10 h-4 rounded bg-muted" />
                  </div>
                  <div className="h-1.5 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-4 text-center">{error}</p>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Clock size={32} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum dado disponível para este período
              </p>
            </div>
          ) : (
            categories.map((cat, index) => {
              const percentage = (cat.minutes / maxMinutes) * 100;
              const hours = (cat.minutes / 60).toFixed(1);

              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  className="p-4 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: cat.color + "26" }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="font-medium text-sm text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className="timer-display text-sm font-bold"
                      style={{ color: cat.color }}
                    >
                      {hours}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        delay: 0.4 + index * 0.08,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
