import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickStartCard } from "./QuickStartCard";
import { RecentHistoryCard } from "./RecentHistoryCard";
import { getDashboardData, getDashboardChart, type ChartData, type DashboardDataResponse } from "@/lib/dashboard";
import { DashboardAreaChart } from "@/components/charts/DashboardAreaChart";
import { ChartPeriodPicker, getDefaultDate, type Period } from "./ChartPeriodPicker";

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<Period>("week");
  const [chartDate, setChartDate] = useState<string>(() => getDefaultDate("week"));
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    let mounted = true;

    void getDashboardData()
      .then((response) => {
        if (!mounted) {
          return;
        }

        setDashboardData(response);
        setError(null);
      })
      .catch((fetchError) => {
        if (!mounted) {
          return;
        }

        setError(String(fetchError));
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!chartDate) return;
    let mounted = true;

    void getDashboardChart(chartPeriod, chartDate)
      .then((response) => {
        if (!mounted) return;
        setChartData(response);
      })
      .catch(() => {
        if (!mounted) return;
        setChartData(null);
      });

    return () => {
      mounted = false;
    };
  }, [chartPeriod, chartDate]);

  const handlePeriodChange = (p: Period, d: string) => {
    setChartPeriod(p);
    setChartDate(d);
  };

  const todayStats = {
    hours: dashboardData?.today_hours ?? 0,
    label: "Hoje",
    icon: Clock,
    colorVar: "--category-work",
  };

  const weekStats = {
    hours: dashboardData?.week_hours ?? 0,
    label: "Esta Semana",
    icon: TrendingUp,
    colorVar: "--category-study",
  };

  const dailyAvg = {
    hours: dashboardData?.daily_avg_hours ?? 0,
    label: "Média Diária",
    icon: Target,
    colorVar: "--category-custom",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bem-vindo ao Spatium — Gerencie seu tempo de forma eficiente
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="mb-8 overflow-x-auto pb-2 md:overflow-visible md:pb-0 scrollbar-custom"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex min-w-max flex-nowrap gap-4 md:min-w-0 md:w-full">
            {[todayStats, weekStats, dailyAvg].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="border-border/60 overflow-hidden relative w-[220px] shrink-0 md:min-w-0 md:w-auto md:flex-1 md:shrink"
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: `hsl(var(${stat.colorVar}))` }}
                  />
                  <CardContent className="p-5 relative h-full flex flex-col">
                    <div className="flex items-start gap-2 mb-3 min-h-[2.75rem]">
                      <Icon
                        size={15}
                        style={{ color: `hsl(var(${stat.colorVar}))` }}
                      />
                      <span className="text-sm text-muted-foreground font-medium leading-tight">
                        {stat.label}
                      </span>
                    </div>
                    <p
                      className="timer-display text-4xl font-bold"
                      style={{ color: `hsl(var(${stat.colorVar}))` }}
                    >
                      {stat.hours.toFixed(1)}h
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Area Chart */}
        {chartData && chartData.series.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Minutos de foco
                  </CardTitle>
                  <ChartPeriodPicker
                    period={chartPeriod}
                    date={chartDate}
                    onChange={handlePeriodChange}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <DashboardAreaChart data={chartData} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Minutos de foco
                  </CardTitle>
                  <ChartPeriodPicker
                    period={chartPeriod}
                    date={chartDate}
                    onChange={handlePeriodChange}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Clock size={32} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado disponível para este período
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Two-column: Timer shortcut + Recent History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickStartCard />

          <RecentHistoryCard
            sessions={dashboardData?.recent_sessions ?? []}
            totalSeconds={dashboardData?.recent_total_secs ?? 0}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
  );
};

export default HomePage;
