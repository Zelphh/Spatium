import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { ChartData } from "@/lib/dashboard";

interface DashboardAreaChartProps {
  data: ChartData;
}

export function DashboardAreaChart({ data }: DashboardAreaChartProps) {
  const options: Highcharts.Options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
    },
    title: { text: undefined },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "var(--muted-foreground)" } },
      lineColor: "var(--border)",
      tickColor: "var(--border)",
    },
    yAxis: {
      title: { text: "Minutos", style: { color: "var(--muted-foreground)" } },
      labels: { style: { color: "var(--muted-foreground)" } },
      gridLineColor: "var(--border)",
      min: 0,
    },
    tooltip: {
      valueSuffix: " min",
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
      style: { color: "var(--foreground)" },
    },
    plotOptions: {
      area: {
        marker: {
          enabled: false,
          states: { hover: { enabled: true, radius: 4 } },
        },
        fillOpacity: 0.25,
        stacking: "normal",
      },
    },
    series: data.series.map((s) => ({
      name: s.name,
      type: "area" as const,
      data: s.data,
    })),
    credits: { enabled: false },
    legend: {
      itemStyle: { color: "var(--foreground)", fontWeight: "normal" },
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
