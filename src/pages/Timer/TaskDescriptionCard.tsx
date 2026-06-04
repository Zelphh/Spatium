import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesCardProps {
  notes: string;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

export function TaskDescriptionCard({
  notes,
  onNotesChange,
  disabled,
}: NotesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/60">
        <CardContent className="p-4">
          <Textarea
            placeholder="Adicione suas notas sobre essa sessão..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={disabled}
            className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60 min-h-[120px]"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
