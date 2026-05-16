import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-4 h-4 text-foreground-muted" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : "text-foreground-muted"}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
