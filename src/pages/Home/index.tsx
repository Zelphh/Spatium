import { useEffect, useState } from "react";
import { QuickStartCard } from "./QuickStartCard";
import { RecentHistoryCard } from "./RecentHistoryCard";
import { getDashboardData, getDashboardChart, type ChartData, type DashboardDataResponse } from "@/lib/dashboard";
import { DashboardAreaChart } from "@/components/charts/DashboardAreaChart";
import { ChartPeriodPicker, getDefaultDate, type Period } from "./ChartPeriodPicker";
import { formatHours } from "@/lib/format";
import { categoryTint } from "@/lib/utils";

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

  const metrics = [
    { label: "Hoje", hours: dashboardData?.today_hours ?? 0, alt: false },
    { label: "Esta semana", hours: dashboardData?.week_hours ?? 0, alt: true },
    { label: "Média diária", hours: dashboardData?.daily_avg_hours ?? 0, alt: false },
  ];

  const hasChartData = !!chartData && chartData.series.length > 0;

  return (
    <section className="screen" aria-label="Home">
      <div>
        <div className="eyebrow">Resumo do foco</div>
        <h1 className="h h1">Seu tempo, em fluxo</h1>
      </div>

      <div className="g3">
        {metrics.map((metric) => (
          <div key={metric.label} className={metric.alt ? "card metric alt" : "card metric"}>
            <div className="bubble" aria-hidden="true" />
            <div className="eyebrow">{metric.label}</div>
            <div className="v">{formatHours(metric.hours)}</div>
          </div>
        ))}
      </div>

      <div className="two">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="h h2">Minutos de foco</h2>
            <ChartPeriodPicker period={chartPeriod} date={chartDate} onChange={handlePeriodChange} />
          </div>

          {hasChartData ? (
            <>
              <div className="scroll">
                <div style={{ minWidth: 420 }}>
                  <DashboardAreaChart data={chartData} />
                </div>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 12 }}>
                {chartData.series.map((serie) => (
                  <span key={serie.name} className="badge" style={categoryTint(serie.color)}>
                    <span className="dot" style={{ background: serie.color }} />
                    {serie.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mut" style={{ textAlign: "center", padding: "60px 0", margin: 0 }}>
              Nenhum dado disponível para este período
            </p>
          )}
        </div>

        <QuickStartCard />
      </div>

      <RecentHistoryCard
        sessions={dashboardData?.recent_sessions ?? []}
        totalSeconds={dashboardData?.recent_total_secs ?? 0}
        isLoading={isLoading}
        error={error}
      />
    </section>
  );
};

export default HomePage;
