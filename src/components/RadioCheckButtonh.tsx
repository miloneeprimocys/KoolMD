import React, { forwardRef } from "react";

export type RadioCheckButtonType = "radio" | "checkbox";

export type RadioCheckButtonhProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  type: RadioCheckButtonType;
};

const controlClassName =
  "h-4 w-4 shrink-0 cursor-pointer rounded border border-border bg-card accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

const RadioCheckButtonh = forwardRef<HTMLInputElement, RadioCheckButtonhProps>(
  ({ type, className = "", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      {...props}
      className={`${controlClassName} ${className}`.trim()}
    />
  ),
);

RadioCheckButtonh.displayName = "RadioCheckButtonh";

export default RadioCheckButtonh;
