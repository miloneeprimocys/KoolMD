import React from "react";
import type { LucideIcon } from "lucide-react";

interface IconActionProps {
  icon: LucideIcon;
  /** Accessible name and tooltip, e.g. "Edit Penicillin". */
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}

/** Small square icon button for row actions in lists and tables. */
const IconAction = ({ icon: Icon, label, onClick, tone = "default" }: IconActionProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      tone === "danger" ? "hover:bg-danger/10 hover:text-danger" : "hover:bg-primary/10 hover:text-primary"
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);

export default IconAction;
