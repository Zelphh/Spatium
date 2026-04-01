import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionCardProps {
  taskDescription: string;
  onTaskDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function TaskDescriptionCard({
  taskDescription,
  onTaskDescriptionChange,
  disabled,
}: TaskDescriptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            O que você está trabalhando?
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <Textarea
            placeholder="Digite a descrição da tarefa..."
            value={taskDescription}
            onChange={(e) => onTaskDescriptionChange(e.target.value)}
            disabled={disabled}
            className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60 min-h-[80px]"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
