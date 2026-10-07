import React from "react";

type ContentAlign = "left" | "center" | "right";
type ContentSize = "sm" | "md";

type ContentProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional icon to render before the title */
  icon?: React.ReactNode;
  /** Optional icon to render before the description */
  subIcon?: React.ReactNode;
  /** Text alignment */
  align?: ContentAlign;
  /** Font size scale */
  size?: ContentSize;
  /** Truncate instead of whitespace-nowrap */
  truncate?: boolean;
  /** Extra class names on the wrapper */
  className?: string;
};

const ALIGN: Record<ContentAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const TITLE_SIZE: Record<ContentSize, string> = {
  sm: "text-xs",
  md: "text-sm",
};

const DESC_SIZE: Record<ContentSize, string> = {
  sm: "text-[11px]",
  md: "text-xs",
};

const Content = ({
  title,
  description,
  icon,
  subIcon,
  align = "left",
  size = "md",
  truncate = false,
  className = "",
}: ContentProps) => {
  const wrap = truncate ? "truncate" : "whitespace-nowrap";

  return (
    <div className={`leading-snug ${ALIGN[align]} ${className}`}>
      <p className={`flex items-center gap-1.5 ${wrap} ${TITLE_SIZE[size]} text-heading`}>
        {icon && <span className="shrink-0 text-body">{icon}</span>}
        <span className={truncate ? "truncate" : ""}>{title}</span>
      </p>
      {description && (
        <p className={`mt-0.5 flex items-center gap-1.5 ${wrap} ${DESC_SIZE[size]} text-body`}>
          {subIcon && <span className="shrink-0">{subIcon}</span>}
          <span className={truncate ? "truncate" : ""}>{description}</span>
        </p>
      )}
    </div>
  );
};

export default Content;