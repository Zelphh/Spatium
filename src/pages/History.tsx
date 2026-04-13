import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock } from "lucide-react";

const History = () => {
  const sessions: {
    id: number;
    category: string;
    duration: string;
    date: string;
    time: string;
  }[] = [];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suas sessões recentes de foco
          </p>
        </motion.div>

        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Sessões</CardTitle>
            <span className="text-xs text-muted-foreground timer-display">
              Total: <span className="text-primary">00:00:00</span>
            </span>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            {sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Clock size={28} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm text-center">
                  Nenhuma entrada de tempo registrada
                </p>
                <p className="text-muted-foreground/60 text-xs text-center">
                  As sessões serão salvas aqui quando você completar um timer
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl
                      hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock size={17} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {session.category}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Calendar size={11} />
                          <span>
                            {session.date} às {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="timer-display text-base font-bold text-primary">
                      {session.duration}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default History;
