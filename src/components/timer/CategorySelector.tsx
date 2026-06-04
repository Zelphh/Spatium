import { motion } from "framer-motion";
import { Category, CategoryType } from "@/pages/type";
import { Briefcase, BookOpen, Gamepad2, Plus } from "lucide-react";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
  onAddCategory?: () => void;
  disabled?: boolean;
}

export const categoryIcons: Record<CategoryType, typeof Briefcase> = {
  work: Briefcase,
  study: BookOpen,
  games: Gamepad2,
  custom: Plus,
};

export const categoryColorClasses: Record<CategoryType, string> = {
  work: "bg-category-work",
  study: "bg-category-study",
  games: "bg-category-games",
  custom: "bg-category-custom",
};

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
  disabled,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-center">
      {categories.map((category) => {
        const Icon = categoryIcons[category.type];
        const isSelected = selectedCategory?.id === category.id;
        const colorClass = categoryColorClasses[category.type];

        return (
          <motion.button
            key={category.id}
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
                className={`absolute inset-0 ${colorClass} rounded-lg opacity-15`}
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
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${colorClass} text-primary-foreground
                `}
              >
                <Icon size={14} />
              </span>
              {category.name}
            </span>
          </motion.button>
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
