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
  /** Truncate date and time lines to fit a narrow table cell */
  truncate?: boolean;
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
  truncate = false,
  className = "",
}: DateTimeProps) => {
  const dateLabel = [day, date].filter(Boolean).join(", ");
  const lineClass = truncate ? "block truncate" : "whitespace-nowrap";

  return (
    <div className={`leading-snug ${ALIGN[align]} ${className}`}>
      {dateLabel && (
        <p className={`${lineClass} text-sm font-medium text-heading`}>
          {icon && <span className="mr-1.5 inline-flex align-middle text-body">{icon}</span>}
          {dateLabel}
        </p>
      )}
      {time && (
        <p
          className={`${lineClass} ${
            dateLabel ? "mt-0.5 text-xs text-body" : "text-sm font-medium text-heading"
          }`}
        >
          {time}
        </p>
      )}
      {sub && (
        <p className={`mt-0.5 ${lineClass} text-xs text-body`}>{sub}</p>
      )}
    </div>
  );
};

export default DateTime;