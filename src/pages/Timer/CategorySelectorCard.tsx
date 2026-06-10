import { motion } from "framer-motion";
import { Category } from "@/pages/type";
import { CategorySelector } from "@/components/timer/CategorySelector";
import { Card, CardContent } from "@/components/ui/card";

interface CategorySelectorCardProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  disabled?: boolean;
}

export function CategorySelectorCard({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  disabled,
}: CategorySelectorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="border-border/60">
        <CardContent className="p-4">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            onAddCategory={onAddCategory}
            onEditCategory={onEditCategory}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
