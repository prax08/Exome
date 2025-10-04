import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react"; // Import React

interface LoadingProps {
  count?: number;
  className?: string;
}

const Loading: React.FC<LoadingProps> = React.memo(({ count = 1, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
});
Loading.displayName = "Loading";

export { Loading };