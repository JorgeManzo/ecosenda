import { HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "active" | "completed" | "upcoming";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-gray-100 text-foreground-muted",
  upcoming: "bg-yellow-100 text-yellow-700",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "active", children, className = "", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-2.5 py-0.5
          rounded-full text-xs font-medium
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
