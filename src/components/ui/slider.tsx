"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

interface SliderWithTooltipProps extends React.ComponentProps<typeof Slider> {
  showTooltip?: boolean;
  tooltipFormat?: (value: number) => string;
}

const SliderWithTooltip = React.forwardRef<
  React.ElementRef<typeof Slider>,
  SliderWithTooltipProps
>(({ className, showTooltip = true, tooltipFormat, ...props }, ref) => {
  const [value, setValue] = React.useState(
    props.defaultValue || props.value || [0]
  );

  const currentValue = props.value || value;

  return (
    <div className="relative w-full">
      <Slider
        ref={ref}
        className={cn("w-full", className)}
        onValueChange={(val) => {
          setValue(val);
          props.onValueChange?.(val);
        }}
        {...props}
      />
      {showTooltip && (
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            left: `calc(${
              ((currentValue[0] - (props.min || 0)) /
              ((props.max || 100) - (props.min || 0))) * 100
            }%)`,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          <div className="bg-foreground text-background text-xs px-2 py-1 rounded-md whitespace-nowrap">
            {tooltipFormat
              ? tooltipFormat(currentValue[0])
              : currentValue[0]}
          </div>
        </div>
      )}
    </div>
  );
});
SliderWithTooltip.displayName = "SliderWithTooltip";

export { Slider, SliderWithTooltip };