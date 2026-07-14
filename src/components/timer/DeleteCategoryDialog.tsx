import { useState } from "react";
import { Category } from "@/pages/type";
import { deleteCategory } from "@/lib/timer";
import { notify } from "@/components/notificationManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCategoryDialogProps {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (category: Category) => void;
}

export function DeleteCategoryDialog({
  category,
  onOpenChange,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    setLoading(true);
    try {
      await deleteCategory({ id: Number(category.id) });
      onDeleted(category);
      notify({ title: "Categoria excluída", message: `"${category.name}" foi excluída com sucesso.` });
      onOpenChange(false);
    } catch (err) {
      notify({
        title: "Erro ao excluir categoria",
        message: String(err),
        borderColor: "hsl(var(--destructive))",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a categoria "{category?.name}"? As sessões que usam essa categoria ficarão sem categoria.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
