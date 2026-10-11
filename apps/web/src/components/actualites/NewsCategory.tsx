import { categoryHex, categoryLabels } from "@/data/news";

/** Pastille de catégorie d'une actualité, à sa couleur. */
export function NewsCategory({ category }: { category: string }) {
  const color = categoryHex[category] ?? "#9ca3af";
  return (
    <span className="label-mono inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px]" style={{ color, borderColor: `${color}66` }}>
      <span className="h-1.5 w-1.5" style={{ background: color }} aria-hidden />
      {categoryLabels[category as keyof typeof categoryLabels] ?? category}
    </span>
  );
}
