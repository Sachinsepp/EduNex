"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialogTriggerCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  isLoading?: boolean;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function DialogTriggerCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  isLoading = false,
  children,
  onOpenChange,
}: DialogTriggerCardProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleOpenChange(true)}
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
              <div className={cn("rounded-full p-3", iconClassName || "bg-primary/10")}>
                <Icon className={cn("h-5 w-5", iconClassName ? "text-white" : "text-primary")} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DialogForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
