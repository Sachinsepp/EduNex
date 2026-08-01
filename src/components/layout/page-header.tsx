import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Section({
  title,
  description,
  children,
  className,
  actions,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function Grid({ children, cols = 3, className }: GridProps) {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colsClasses[cols], className)}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  justify?: "start" | "end" | "center" | "between" | "around";
  align?: "start" | "end" | "center" | "stretch";
  className?: string;
  wrap?: boolean;
}

export function Flex({
  children,
  direction = "row",
  gap = 4,
  justify,
  align,
  className,
  wrap = false,
}: FlexProps) {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
  };

  const justifyClasses = {
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
  };

  const alignClasses = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    stretch: "items-stretch",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        `gap-${gap}`,
        justify && justifyClasses[justify],
        align && alignClasses[align],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}
