import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  emptyIcon: EmptyIcon,
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {EmptyIcon && (
          <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />
        )}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                "border-t transition-colors hover:bg-muted/50",
                onRowClick && "cursor-pointer",
                rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn("px-4 py-3 text-sm", column.className)}
                >
                  {column.cell
                    ? column.cell(row)
                    : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
