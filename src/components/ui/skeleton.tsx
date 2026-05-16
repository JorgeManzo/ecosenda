import { HTMLAttributes, forwardRef } from "react";

type SkeletonVariant = "card" | "text" | "avatar";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantStyles: Record<SkeletonVariant, string> = {
  card: "h-32 w-full rounded-xl",
  text: "h-4 w-full rounded",
  avatar: "h-10 w-10 rounded-full",
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-gray-200 animate-pulse
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
