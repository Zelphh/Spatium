import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Briefcase, BookOpen, Gamepad2, TrendingUp } from "lucide-react";

type Period = "day" | "week" | "month";

const Stats = () => {
  const [period, setPeriod] = useState<Period>("week");

  const stats = {
    total: "0h 0min",
    categories: [
      {
        name: "Trabalho",
        hours: 0,
        icon: Briefcase,
        colorVar: "--category-work",
      },
      {
        name: "Estudo",
        hours: 0,
        icon: BookOpen,
        colorVar: "--category-study",
      },
      { name: "Jogos", hours: 0, icon: Gamepad2, colorVar: "--category-games" },
    ],
  };

  const maxHours = Math.max(...stats.categories.map((c) => c.hours), 1);

  return (
    <AppLayout>
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
              <p className="timer-display text-5xl font-bold text-primary timer-glow">
                {stats.total}
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
            {stats.categories.map((cat, index) => {
              const Icon = cat.icon;
              const percentage = (cat.hours / maxHours) * 100;
              const color = `hsl(var(${cat.colorVar}))`;

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
                        style={{
                          backgroundColor: `hsl(var(${cat.colorVar}) / 0.15)`,
                        }}
                      >
                        <Icon size={15} style={{ color }} />
                      </div>
                      <span className="font-medium text-sm text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className="timer-display text-sm font-bold"
                      style={{ color }}
                    >
                      {cat.hours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
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
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Stats;
