import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:pointer-events-none disabled:opacity-50 rounded-[4px]",
  {
    variants: {
      variant: {
        navy: "bg-navy text-white hover:bg-navy/90",
        default: "bg-navy text-white hover:bg-navy/90",
        secondary: "border border-border bg-surface text-text-primary hover:bg-bg",
        ghost: "text-text-primary hover:bg-bg",
        destructive: "bg-red text-white hover:bg-red/90",
        outline: "border border-cyan bg-transparent text-cyan hover:bg-bg",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
        field: "h-14 min-h-[48px] w-full px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "navy",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
