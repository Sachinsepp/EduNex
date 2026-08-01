import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  onClick,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        onClick && "cursor-pointer hover:shadow-md transition-shadow"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {description && !isLoading && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "rounded-full p-3",
                iconClassName || "bg-primary/10"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  iconClassName ? "text-white" : "text-primary"
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
