"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, icon, iconPosition = "left", ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5
              rounded-lg border border-gray-200
              bg-white text-foreground
              placeholder:text-foreground-muted
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-all duration-200
              ${icon && iconPosition === "left" ? "pl-10" : ""}
              ${icon && iconPosition === "right" ? "pr-10" : ""}
              ${error ? "border-red-500 focus:ring-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";