"use client";

import React, { ReactNode } from "react";
import { Plus } from "lucide-react";

interface AddInternalButtonProps {
  /** Button label */
  text?: string;
  /** Pass `null` to hide the icon. Defaults to a `Plus` icon. */
  icon?: ReactNode | null;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Extra class names appended to the button */
  className?: string;
}

const AddInternalButton = ({
  text = "Add",
  icon = <Plus className="h-4 w-4" />,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: AddInternalButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 text-sm font-medium text-primary transition-all duration-200 hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {text}
    </button>
  );
};

export default AddInternalButton;