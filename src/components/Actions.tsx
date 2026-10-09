import React from "react";
import { Eye, SquarePen, Trash2, Download } from "lucide-react";

export type ActionType = "view" | "edit" | "delete" | "download";

const CONFIG = {
  view: {
    Icon: Eye,
    label: "View",
    hover: "hover:bg-primary/10 hover:text-primary",
  },
  edit: {
    Icon: SquarePen,
    label: "Edit",
    hover: "hover:bg-success/10 hover:text-success",
  },
  delete: {
    Icon: Trash2,
    label: "Delete",
    hover: "hover:bg-danger/10 hover:text-danger",
  },
  download: {
    Icon: Download,
    label: "Download",
    hover: "hover:bg-primary/10 hover:text-primary",
  },
} as const;

type ActionsProps = {
  /** Which actions to render */
  actions?: ActionType[];
  /** Called with the action type and the row's id (if provided) */
  onAction?: (action: ActionType) => void;
  /** Icon size preset */
  size?: "sm" | "md" | "lg";
  /** Extra class names */
  className?: string;
};

const SIZES = {
  sm: { btn: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { btn: "h-8 w-8", icon: "h-4 w-4" },
  lg: { btn: "h-9 w-9", icon: "h-[18px] w-[18px]" },
} as const;

const Actions = ({
  actions = ["view", "edit"],
  onAction,
  size = "md",
  className = "",
}: ActionsProps) => {
  const { btn, icon } = SIZES[size];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {actions.map((a) => {
        const { Icon, label, hover } = CONFIG[a];
        return (
          <button
            key={a}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => onAction?.(a)}
            className={`flex ${btn} cursor-pointer items-center justify-center rounded-lg text-label transition-all duration-200 active:scale-90 ${hover}`}
          >
            <Icon className={icon} />
          </button>
        );
      })}
    </div>
  );
};

export default Actions;