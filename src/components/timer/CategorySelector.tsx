import { Category } from "@/pages/type";
import { cn, categoryTint } from "@/lib/utils";
import { Briefcase, BookOpen, Gamepad2, Plus, Tag, Code2, Music, Heart, Star, Zap, Coffee, Pencil, Trash2 } from "lucide-react";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  disabled?: boolean;
  /** Chips menores, sem ícone nem ações (modo mini). */
  compact?: boolean;
}

export const categoryIcons: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  book: BookOpen,
  gamepad: Gamepad2,
  code: Code2,
  music: Music,
  heart: Heart,
  star: Star,
  zap: Zap,
  coffee: Coffee,
};

export function getCategoryIcon(icon?: string | null) {
  if (!icon) {
    return Tag;
  }

  return categoryIcons[icon] ?? Tag;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  disabled,
  compact,
}: CategorySelectorProps) {
  return (
    <div className="row" style={{ gap: compact ? 6 : 8, justifyContent: compact ? "center" : undefined }}>
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const isSelected = selectedCategory?.id === category.id;
        const chip = (
          <button
            type="button"
            className={cn("chip", isSelected && "sel")}
            style={categoryTint(category.color)}
            aria-pressed={isSelected}
            aria-label={compact ? category.name : undefined}
            disabled={disabled}
            onClick={() => onCategoryChange(category)}
          >
            <span className="dot" style={{ background: category.color }} />
            {compact ? (
              <span style={{ fontSize: 13 }}>{category.name}</span>
            ) : (
              <>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {category.name}
              </>
            )}
          </button>
        );

        if (compact || (!onEditCategory && !onDeleteCategory)) {
          return <span key={category.id}>{chip}</span>;
        }

        return (
          <span key={category.id} className="catp">
            {chip}
            <span className="acts">
              {onEditCategory && (
                <button
                  type="button"
                  className="mini-ic"
                  aria-label={`Editar ${category.name}`}
                  onClick={() => onEditCategory(category)}
                >
                  <Pencil strokeWidth={1.8} aria-hidden="true" />
                </button>
              )}
              {onDeleteCategory && (
                <button
                  type="button"
                  className="mini-ic"
                  aria-label={`Excluir ${category.name}`}
                  onClick={() => onDeleteCategory(category)}
                >
                  <Trash2 strokeWidth={1.8} aria-hidden="true" />
                </button>
              )}
            </span>
          </span>
        );
      })}

      {onAddCategory && !compact && (
        <button type="button" className="round sm" aria-label="Adicionar categoria" onClick={onAddCategory}>
          <Plus className="ico" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
