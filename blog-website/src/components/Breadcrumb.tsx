import { Link } from "react-router-dom";
import { getCategories } from "@/lib/content";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  category: string;
  title: string;
}

export function Breadcrumb({ category, title }: BreadcrumbProps) {
  const cats = getCategories();
  const cat = cats.find((c) => c.slug === category);

  return (
    <nav className="flex items-center gap-1 text-[12px] text-muted-foreground mb-4 font-mono">
      <Link to="/" className="hover:text-foreground transition-colors">Docs</Link>
      <ChevronRight className="w-3 h-3 opacity-40" />
      <span className="hover:text-foreground transition-colors">{cat?.name || category}</span>
      <ChevronRight className="w-3 h-3 opacity-40" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
    </nav>
  );
}
