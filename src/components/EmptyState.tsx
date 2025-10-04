import * as React from "react";
import { PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-muted-foreground",
        className,
      )}
    >
      <div className="mb-4 text-5xl text-gray-400">
        {icon || <PackageX size={64} />}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      {description && <p className="mb-4 text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export { EmptyState };