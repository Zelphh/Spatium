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
        borderColor: "var(--danger)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>Excluir “{category?.name}”?</DialogTitle>
          <DialogDescription>
            As sessões dessa categoria ficarão sem categoria. Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <button type="button" className="btn ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="btn danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
