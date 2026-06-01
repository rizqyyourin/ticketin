import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="size-3.5 text-zinc-400 flex-shrink-0" />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
