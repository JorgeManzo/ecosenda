import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-xl shadow-soft p-4 md:p-6
          ${interactive ? "card-interactive" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";