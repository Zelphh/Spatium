import { useState } from "react";
import { Category } from "@/pages/type";
import { createCategory } from "@/lib/timer";
import { notify } from "@/components/notificationManager";
import { categoryIcons } from "@/components/timer/CategorySelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
}

const DEFAULT_COLOR = "#8B5CF6";
const DEFAULT_ICON = "briefcase";

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);
  const [loading, setLoading] = useState(false);

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
      const category = await createCategory({
        name: trimmed,
        color,
        icon: selectedIcon,
      });
      onCreated(category);
      notify({ title: "Categoria criada", message: `"${trimmed}" foi adicionada com sucesso.` });
      handleClose(false);
    } catch (err) {
      notify({
        title: "Erro ao criar categoria",
        message: String(err),
        borderColor: "hsl(var(--destructive))",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name" className="mb-1">Nome</Label>
            <Input
              id="category-name"
              placeholder="Ex: Estudo, Trabalho..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          {/* Cor */}
          <div className="flex flex-col gap-1.5">
            <Label>Cor</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-1"
              />
            </div>
          </div>

          {/* Ícone */}
          <div className="flex flex-col gap-1.5">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryIcons).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIcon(key)}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-150
                    ${selectedIcon === key
                      ? "border-transparent shadow-md"
                      : "border-border hover:border-muted-foreground/40 bg-card"
                    }`}
                  style={selectedIcon === key ? { backgroundColor: color } : undefined}
                  title={key}
                >
                  <Icon
                    size={16}
                    className={selectedIcon === key ? "text-white" : "text-muted-foreground"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
