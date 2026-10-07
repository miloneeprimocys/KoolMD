import React from "react";

type DateTimeAlign = "left" | "center" | "right";

type DateTimeProps = {
  day?: string;
  time?: string;
  date?: string;
  /** Optional secondary line rendered below the date */
  sub?: string;
  /** Optional leading icon (e.g., a clock) */
  icon?: React.ReactNode;
  /** Text alignment */
  align?: DateTimeAlign;
  /** Extra class names */
  className?: string;
};

const ALIGN: Record<DateTimeAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const DateTime = ({
  day,
  time,
  date,
  sub,
  icon,
  align = "left",
  className = "",
}: DateTimeProps) => {
  const top = [day, time].filter(Boolean).join(", ");

  return (
    <div className={`leading-snug ${ALIGN[align]} ${className}`}>
      {top && (
        <p className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-heading">
          {icon && <span className="shrink-0 text-body">{icon}</span>}
          <span>{top}</span>
        </p>
      )}
      {date && (
        <p
          className={`whitespace-nowrap ${
            top ? "mt-0.5 text-xs text-body" : "text-sm font-medium text-heading"
          }`}
        >
          {date}
        </p>
      )}
      {sub && (
        <p className="mt-0.5 whitespace-nowrap text-xs text-body">{sub}</p>
      )}
    </div>
  );
};

export default DateTime;