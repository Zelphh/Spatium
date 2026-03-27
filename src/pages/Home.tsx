import { motion } from "framer-motion";
import { Clock, TrendingUp, Target } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  label: "Média Diár ia",
  icon: Target,
  colorVar: "--category-custom",
};

const recentSessions: {
  id: number;
  category: string;
  duration: string;
  time: string;
}[] = [];

const HomePage = () => {
  return (
    <AppLayout>
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
          className="mb-8 overflow-x-auto pb-2 md:overflow-visible md:pb-0"
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
          {/* Quick Start Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border/60 h-full overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Início Rápido
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-6 flex flex-col items-center gap-6">
                {/* Big clock display */}
                <div className="text-center">
                  <p className="timer-display text-4xl font-bold text-primary timer-glow mt-4">
                    00:00:00
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pronto para iniciar
                  </p>
                </div>

                {/* Quick category badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Trabalho", "Estudo", "Jogos"].map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs px-3 py-1"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>

                <a
                  href="/timer"
                  className="gradient-primary text-white rounded-lg px-8 py-3 text-sm font-semibold
                    flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Clock size={16} />
                  Abrir Timer
                </a>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Histórico Recente
                </CardTitle>
                <span className="text-xs text-muted-foreground timer-display">
                  Total: <span className="text-primary">00:00:00</span>
                </span>
              </CardHeader>
              <Separator />
              <CardContent className="p-6">
                {recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Clock size={26} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhuma entrada de tempo registrada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{s.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.time}
                          </p>
                        </div>
                        <span className="timer-display text-sm text-primary font-medium">
                          {s.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage;
