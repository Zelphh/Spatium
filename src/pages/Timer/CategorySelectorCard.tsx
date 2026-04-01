import { motion } from "framer-motion";
import { Category } from "@/types/timer";
import { CategorySelector } from "@/components/timer/CategorySelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CategorySelectorCardProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategoryChange: (category: Category) => void;
  disabled?: boolean;
}

export function CategorySelectorCard({
  categories,
  selectedCategory,
  onCategoryChange,
  disabled,
}: CategorySelectorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Categoria
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
