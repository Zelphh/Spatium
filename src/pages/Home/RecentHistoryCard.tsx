import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RecentSession = {
  id: number;
  category: string;
  duration: string;
  time: string;
};

const recentSessions: RecentSession[] = [];

export const RecentHistoryCard = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.25 }}
  >
    <Card className="border-border/60 h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Histórico Recente</CardTitle>
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
                  <p className="text-xs text-muted-foreground">{s.time}</p>
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
);
