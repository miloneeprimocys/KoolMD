import React from "react";

export type TableColumn = {
  key: string;
  label: string;
  className?: string;
  /** Optional custom header node (overrides `label`) */
  header?: React.ReactNode;
};

const TableHeader = ({ columns }: { columns: TableColumn[] }) => (
  <thead>
    <tr>
      {columns.map((c) => (
        <th
          key={c.key}
          scope="col"
          className={`sticky top-0 z-10 whitespace-nowrap bg-[#F0F0F0] px-4 py-4 text-[13px] font-semibold text-label shadow-[inset_0_-1px_0_var(--border)] dark:bg-[#1b2544] sm:px-5 sm:py-[18px] sm:text-sm ${
            c.className ?? ""
          }`}
        >
          <div className="flex items-center">
            {/* Renders the custom header node (e.g., a checkbox) when provided.
                Wrapping in a flex row + items-center keeps it aligned with text. */}
            {c.header ?? <span className="leading-none">{c.label}</span>}
          </div>
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;