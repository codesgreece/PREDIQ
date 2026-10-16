import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--neon)] text-[#04140f] hover:bg-[var(--teal)]",
        secondary:
          "bg-[var(--card-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)]",
        ghost: "hover:bg-white/5 text-[var(--text)]",
        danger: "bg-[var(--danger)]/90 text-white hover:bg-[var(--danger)]",
        outline:
          "border border-[var(--neon)]/40 text-[var(--neon)] hover:bg-[var(--neon)]/10",
      },
      size: {
        default: "h-[var(--btn-h)] px-3.5",
        sm: "h-8 rounded-[var(--radius-sm)] px-2.5 text-xs",
        lg: "h-11 px-5",
        icon: "h-[var(--btn-h)] w-[var(--btn-h)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";
