import { useState } from "react";
import { motion } from "framer-motion";
import { Category } from "@/pages/type";
import { Briefcase, BookOpen, Gamepad2, Plus, Tag, Code2, Music, Heart, Star, Zap, Coffee, Pencil } from "lucide-react";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  disabled?: boolean;
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
};

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  disabled,
}: CategorySelectorProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3 justify-center">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const isSelected = selectedCategory?.id === category.id;
        const isHovered = hoveredId === Number(category.id);
        const colorStyle = { backgroundColor: category.color };

        return (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => setHoveredId(Number(category.id))}
            onMouseLeave={() => setHoveredId(null)}
          >
            <motion.button
              onClick={() => !disabled && onCategoryChange(category)}
              disabled={disabled}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                border-2 transition-all duration-200
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isSelected
                    ? "border-transparent shadow-md"
                    : "border-border hover:border-muted-foreground/30 bg-card"
                }
              `}
              whileHover={!disabled ? { scale: 1.03, y: -2 } : undefined}
              whileTap={!disabled ? { scale: 0.97 } : undefined}
            >
              {isSelected && (
                <motion.div
                  layoutId="category-bg"
                  className="absolute inset-0 rounded-lg"
                  style={colorStyle}
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`
                  relative z-10 flex items-center gap-2
                  ${isSelected ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground"
                  style={colorStyle}
                >
                  <Icon size={14} />
                </span>
                {category.name}
              </span>
            </motion.button>

            {/* Edit button on hover */}
            {onEditCategory && isHovered && !disabled && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(category);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/60 transition-colors z-20"
                title="Editar categoria"
              >
                <Pencil size={10} />
              </motion.button>
            )}
          </div>
        );
      })}

      {/* Add category button */}
      <motion.button
        onClick={onAddCategory}
        className="flex items-center justify-center w-9 h-9 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Adicionar categoria"
      >
        <Plus size={16} />
      </motion.button>
    </div>
  );
}
