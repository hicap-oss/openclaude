import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-oc-accent text-white",
        secondary: "bg-oc-card text-oc-text-muted",
        success: "bg-oc-success/20 text-oc-success",
        warning: "bg-oc-warning/20 text-oc-warning",
        error: "bg-oc-error/20 text-oc-error",
        info: "bg-oc-info/20 text-oc-info",
        outline: "border border-oc-border text-oc-text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
