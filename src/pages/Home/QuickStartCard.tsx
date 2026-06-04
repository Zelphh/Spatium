import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const QuickStartCard = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    <Card className="border-border/60 h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Início Rápido</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 flex flex-col items-center justify-center gap-6 pt-0">
        <div className="text-center">
          <p className="timer-display text-5xl font-bold text-primary timer-glow mt-4">
            00:00:00
          </p>
          <p className="text-sm text-muted-foreground mt-2">Pronto para iniciar</p>
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
);
