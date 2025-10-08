import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-primary font-semibold uppercase tracking-wide transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-semibold uppercase tracking-wide">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
