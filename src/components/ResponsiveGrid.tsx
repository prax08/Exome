import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = React.memo(({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
  className,
  ...props
}) => {
  const gridClasses = cn(
    `grid`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols["2xl"] && `2xl:grid-cols-${cols["2xl"]}`,
    `gap-${gap}`,
    className,
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
});
ResponsiveGrid.displayName = "ResponsiveGrid";

export { ResponsiveGrid };