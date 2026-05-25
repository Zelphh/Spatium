import { motion } from "framer-motion";
import { Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QuickStartCard } from "./QuickStartCard";
import { RecentHistoryCard } from "./RecentHistoryCard";

const todayStats = {
  hours: 0,
  label: "Hoje",
  icon: Clock,
  colorVar: "--category-work",
};

const weekStats = {
  hours: 0,
  label: "Esta Semana",
  icon: TrendingUp,
  colorVar: "--category-study",
};

const dailyAvg = {
  hours: 0,
  label: "Média Diária",
  icon: Target,
  colorVar: "--category-custom",
};

const HomePage = () => {
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

        {/* Two-column: Timer shortcut + Recent History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickStartCard />

          <RecentHistoryCard />
        </div>
      </div>
  );
};

export default HomePage;
