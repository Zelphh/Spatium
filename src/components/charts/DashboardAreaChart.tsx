import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { ChartData } from "@/lib/dashboard";

interface DashboardAreaChartProps {
  data: ChartData;
}

export function DashboardAreaChart({ data }: DashboardAreaChartProps) {
  const { theme } = useTheme();
  const resolvedTheme = theme ?? "dark";
  const isDark = resolvedTheme === "dark";

  const axisLabelColor = isDark ? "#e5e7eb" : "#0f172a"; // light for dark theme, dark for light theme
  const tooltipTextColor = isDark ? "#ffffff" : "#0f172a";

  const options: Highcharts.Options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
    },
    title: { text: undefined },
    xAxis: {
      categories: data?.categories,
      labels: { style: { color: axisLabelColor } },
      lineColor: "var(--border)",
      tickColor: "var(--border)",
    },
    yAxis: {
      title: { text: "Minutos", style: { color: axisLabelColor } },
      labels: { style: { color: axisLabelColor } },
      gridLineColor: "var(--border)",
      min: 0,
    },
    tooltip: {
      valueSuffix: " min",
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
      style: { color: tooltipTextColor },
    },
    plotOptions: {
      area: {
        marker: {
          enabled: false
        }
      }
    },
    series: data?.series.map((s) => ({
      name: s?.name,
      type: "area" as const,
      data: s?.data,
      color: s?.color,
    })),
    credits: { enabled: false },
    legend: {
      itemStyle: { color: tooltipTextColor, fontWeight: "normal" },
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
