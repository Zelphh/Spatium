import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useTheme } from "next-themes";
import type { ChartData } from "@/lib/dashboard";

interface DashboardAreaChartProps {
  data: ChartData;
}

// Highcharts não resolve variáveis CSS em todos os pontos (ex.: texto do SVG), então as
// cores do tema são repetidas aqui.
const THEME_COLORS = {
  dark: { mut: "#aaa6ba", line: "rgba(255,255,255,.13)", ink: "#f3f1f8", bg: "#100f17" },
  light: { mut: "#5b5868", line: "rgba(30,25,50,.12)", ink: "#1d1b24", bg: "#f3f1ee" },
};

export function DashboardAreaChart({ data }: DashboardAreaChartProps) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme === "light" ? "light" : "dark"];

  const options: Highcharts.Options = {
    chart: {
      type: "areaspline",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
      height: 260,
      spacing: [8, 4, 4, 4],
    },
    title: { text: undefined },
    xAxis: {
      categories: data?.categories,
      labels: { style: { color: colors.mut, fontSize: "12px", fontWeight: "600" } },
      lineWidth: 0,
      tickLength: 0,
    },
    yAxis: {
      title: { text: undefined },
      labels: { enabled: false },
      gridLineColor: colors.line,
      gridLineDashStyle: "Dash",
      tickAmount: 4,
      min: 0,
    },
    tooltip: {
      shared: true,
      valueSuffix: " min",
      backgroundColor: colors.ink,
      borderWidth: 0,
      borderRadius: 18,
      shadow: false,
      style: { color: colors.bg, fontWeight: "600" },
    },
    plotOptions: {
      areaspline: {
        stacking: "normal",
        fillOpacity: 0.85,
        lineWidth: 0,
        marker: { enabled: false },
        states: { hover: { lineWidth: 0 } },
      },
    },
    series: data?.series.map((s) => ({
      name: s?.name,
      type: "areaspline" as const,
      data: s?.data,
      color: s?.color,
    })),
    credits: { enabled: false },
    legend: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
