import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function QuickAction({
  href,
  label,
  icon: Icon,
  variant = "outline",
  className,
}: QuickActionProps) {
  return (
    <Button asChild variant={variant} className={cn("h-auto py-3", className)}>
      <Link href={href} className="flex flex-col items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{label}</span>
      </Link>
    </Button>
  );
}

interface QuickActionsGridProps {
  actions: QuickActionProps[];
  className?: string;
}

export function QuickActionsGrid({ actions, className }: QuickActionsGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {actions.map((action) => (
        <QuickAction key={action.href} {...action} />
      ))}
    </div>
  );
}
