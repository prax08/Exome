"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Define the type for Lucide icons
type LucideIconName = keyof typeof LucideIcons;

interface IconPickerProps {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  children: React.ReactNode;
}

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelectIcon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const allLucideIcons = Object.keys(LucideIcons).filter(
    (name) => typeof (LucideIcons as any)[name] === 'function'
  ) as LucideIconName[];

  const filteredIcons = allLucideIcons.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onSelectIcon(iconName);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-4 gap-2 p-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              return (
                <Button
                  key={iconName}
                  variant={currentIcon === iconName ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => handleSelect(iconName)}
                  className={cn(
                    "flex flex-col h-auto w-auto p-2",
                    currentIcon === iconName && "bg-accent text-accent-foreground"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs mt-1 truncate w-full">{iconName}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export { IconPicker };