import { useEffect, useState } from "react";
import { Category } from "@/pages/type";
import { createCategory, updateCategory } from "@/lib/timer";
import { notify } from "@/components/notificationManager";
import { categoryIcons } from "@/components/timer/CategorySelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
  onUpdated?: (category: Category) => void;
  editCategory?: Category | null;
}

const DEFAULT_COLOR = "#8B5CF6";
const DEFAULT_ICON = "briefcase";

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreated,
  onUpdated,
  editCategory,
}: CreateCategoryDialogProps) {
  const isEditing = !!editCategory;

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setName(editCategory.name);
        setColor(editCategory.color);
        setSelectedIcon(editCategory.icon ?? DEFAULT_ICON);
      } else {
        setName("");
        setColor(DEFAULT_COLOR);
        setSelectedIcon(DEFAULT_ICON);
      }
    }
  }, [open, editCategory]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setColor(DEFAULT_COLOR);
      setSelectedIcon(DEFAULT_ICON);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      if (isEditing && editCategory) {
        const category = await updateCategory({
          id: Number(editCategory.id),
          name: trimmed,
          color,
          icon: selectedIcon,
        });
        onUpdated?.(category);
        notify({ title: "Categoria atualizada", message: `"${trimmed}" foi atualizada com sucesso.` });
      } else {
        const category = await createCategory({
          name: trimmed,
          color,
          icon: selectedIcon,
        });
        onCreated(category);
        notify({ title: "Categoria criada", message: `"${trimmed}" foi adicionada com sucesso.` });
      }
      handleClose(false);
    } catch (err) {
      notify({
        title: isEditing ? "Erro ao atualizar categoria" : "Erro ao criar categoria",
        message: String(err),
        borderColor: "var(--danger)",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>

        <label className="lab">
          Nome
          <input
            className="input"
            type="text"
            placeholder="Ex: Estudo, Trabalho..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </label>

        <div className="lab">
          Cor
          <div className="row">
            <input
              type="color"
              aria-label="Cor da categoria"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 64, height: 48, border: 0, borderRadius: 24, padding: 0, background: "none", cursor: "pointer" }}
            />
            <span
              className="dot"
              style={{
                background: color,
                width: 34,
                height: 34,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 28%, transparent)`,
              }}
            />
          </div>
        </div>

        <div className="lab">
          Ícone
          <div className="icgrid" role="group" aria-label="Ícone">
            {Object.entries(categoryIcons).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                className={selectedIcon === key ? "sel" : ""}
                aria-label={key}
                aria-pressed={selectedIcon === key}
                onClick={() => setSelectedIcon(key)}
              >
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-1">
          <button type="button" className="btn ghost" onClick={() => handleClose(false)} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="btn" onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading
              ? isEditing ? "Salvando..." : "Criando..."
              : isEditing ? "Salvar" : "Criar"
            }
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
