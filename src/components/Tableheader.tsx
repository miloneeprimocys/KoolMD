import React, { useEffect, useRef } from "react";

export type TableColumn = {
  key: string;
  label: string;
  className?: string;
  width?: number;
  /** Optional custom header node (overrides `label`) */
  header?: React.ReactNode;
};

type SelectAllState = {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
};

export const SelectAllCheckbox = ({
  checked,
  indeterminate,
  onChange,
}: SelectAllState) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      aria-label="Select all"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    />
  );
};

const TableHeader = ({
  columns,
  selectAll,
}: {
  columns: TableColumn[];
  selectAll?: SelectAllState;
}) => (
  <thead>
    <tr className="bg-[#f1f6fc] dark:bg-[#0b2f5e]">
      {columns.map((c) => (
        <th
          key={c.key}
          scope="col"
          className={`sticky top-0 z-10 whitespace-nowrap bg-[#f1f6fc] h-[58px] px-4 text-[13px] font-semibold text-label dark:bg-[#0b2f5e] dark:text-white sm:px-5 sm:text-sm ${
            c.className ?? ""
          }`}
        >
          <div className="flex min-w-0 items-center">
            {/* Renders the custom header node (e.g., a checkbox) when provided.
                Wrapping in a flex row + items-center keeps it aligned with text. */}
            {c.key === "select" && selectAll ? (
              <SelectAllCheckbox {...selectAll} />
            ) : (
              c.header ?? <span className="leading-none">{c.label}</span>
            )}
          </div>

        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;