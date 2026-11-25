"use client";

import React, { ReactNode } from "react";
import { Upload } from "lucide-react";

interface ImportButtonProps {
  text?: ReactNode;
  /** Pass `null` to render without an icon */
  icon?: ReactNode | null;
  onClick?: () => void;
  disabled?: boolean;
  /** Extra class names appended to the button */
  className?: string;
}

const ImportButton: React.FC<ImportButtonProps> = ({
  text = "Import Patients",
  icon = (
    <Upload className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-4 sm:w-4" />
  ),
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-heading transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:gap-2 sm:rounded-lg sm:px-5 sm:text-sm ${className}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default ImportButton;