import * as React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.ComponentPropsWithoutRef<typeof ShadcnSelect> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  contentClassName?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = React.memo(({
  options,
  placeholder,
  label,
  className,
  contentClassName,
  onValueChange,
  defaultValue,
  value,
  ...props
}) => {
  return (
    <ShadcnSelect onValueChange={onValueChange} defaultValue={defaultValue} value={value} {...props}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn(contentClassName)}>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </ShadcnSelect>
  );
});
Select.displayName = "Select";

export { Select };