"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/Button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileActionSheetProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode; // Actions to be displayed inside the sheet
  className?: string;
}

const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  trigger,
  title = "Actions",
  description = "Select an action for this item.",
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open actions menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className={cn("h-auto max-h-[80vh]", className)}>
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 py-4">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // Explicitly assert the type of the child's props to include onClick and className
              const typedChild = child as React.ReactElement<{ onClick?: () => void; className?: string }>;
              return React.cloneElement(typedChild, {
                onClick: () => {
                  setIsOpen(false);
                  // Safely call original onClick if it exists
                  if (typedChild.props.onClick) {
                    typedChild.props.onClick();
                  }
                },
                className: cn("w-full justify-start", typedChild.props.className), // Ensure buttons fill width
              });
            }
            return child;
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { MobileActionSheet };