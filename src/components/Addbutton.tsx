import React, { ReactNode } from "react";
import { Plus } from "lucide-react";

interface AddButtonProps {
  text?: string;
  /** Pass `null` to render without an icon */
  icon?: ReactNode | null;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Extra class names appended to the button */
  className?: string;
}

const AddButton = ({
  text = "Add Patients",
  icon = (
    <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
  ),
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: AddButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative isolate inline-flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-primary bg-primary px-5 text-sm font-medium text-on-primary shadow-md shadow-primary/25 transition-all duration-300 ease-out hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {/* shine sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-on-primary/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
      />
      {icon && <span className="relative flex items-center">{icon}</span>}
      <span className="relative">{text}</span>
    </button>
  );
};

export default AddButton;