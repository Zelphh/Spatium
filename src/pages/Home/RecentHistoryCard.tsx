import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SessionListItem } from "@/lib/dashboard";
import { formatDuration } from "@/lib/timer";

interface RecentHistoryCardProps {
  sessions: SessionListItem[];
  totalSeconds: number;
  isLoading: boolean;
  error: string | null;
}

const formatSessionDateTime = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const RecentHistoryCard = ({
  sessions,
  totalSeconds,
  isLoading,
  error,
}: RecentHistoryCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.25 }}
    style={{ height: "380px" }}
  >
    <Card className="border-border/60 flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Histórico Recente
        </CardTitle>
        <span className="text-xs text-muted-foreground timer-display">
          Total:{" "}
          <span className="text-primary">{formatDuration(totalSeconds)}</span>
        </span>
      </CardHeader>
      <Separator />
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-6 pr-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Carregando histórico...
          </p>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-12">{error}</p>
        ) : sessions.length === 0 ? (
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
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{s.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSessionDateTime(s.created_at)}
                  </p>
                </div>
                <span className="timer-display text-sm text-primary font-medium">
                  {formatDuration(s.duration_secs)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);
