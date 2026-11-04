import type { Category } from "@/pages/type";

const NO_CATEGORY_COLOR = "#94a3b8";

/** Chip estático com a categoria atual (ou "Sem categoria"). */
export function CategoryChip({ category }: { category: Category | null }) {
  return (
    <span className="chip">
      <span className="dot" style={{ background: category?.color ?? NO_CATEGORY_COLOR }} />
      {category?.name ?? "Sem categoria"}
    </span>
  );
}
