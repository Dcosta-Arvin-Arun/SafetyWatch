"use client";

import * as React from "react";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

const ToggleGroupContext = React.createContext<{
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type: "single" | "multiple";
}>({
  value: "",
  onChange: () => {},
  type: "single",
});

interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonVariants> {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  type?: "single" | "multiple";
  disabled?: boolean;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      className,
      variant,
      size,
      value,
      onValueChange,
      type = "single",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <ToggleGroupContext.Provider
        value={{
          value,
          onChange: onValueChange,
          type,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center gap-1",
            disabled && "pointer-events-none opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  (
    { className, variant = "outline", size, value, children, ...props },
    ref
  ) => {
    const context = React.useContext(ToggleGroupContext);

    if (!context) {
      throw new Error("ToggleGroupItem must be used within a ToggleGroup");
    }

    const { value: groupValue, onChange, type } = context;

    const isSelected =
      type === "single"
        ? groupValue === value
        : Array.isArray(groupValue) && groupValue.includes(value);

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant: isSelected ? "default" : variant,
            size,
          }),
          "hover:bg-muted hover:text-muted-foreground",
          isSelected && "bg-primary text-primary-foreground",
          className
        )}
        onClick={() => {
          if (type === "single") {
            onChange(value);
          } else {
            const currentValue = groupValue as string[];
            const newValue = currentValue.includes(value)
              ? currentValue.filter((v) => v !== value)
              : [...currentValue, value];
            onChange(newValue);
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };