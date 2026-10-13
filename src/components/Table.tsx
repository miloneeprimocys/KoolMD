import React from "react";

import TableHeader, { type TableColumn } from "./Tableheader";

type TableProps = {
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
  fillHeight?: boolean;
};

const Table = ({ columns, rows, fillHeight = false }: TableProps) => {
  const getFixedWidth = (column: TableColumn) =>
    column.width ?? (column.className?.split(/\s+/).includes("w-10") ? 40 : undefined);

  return (
    <div
      className={`flex ${
        rows.length === 0 ? "h-[65vh]" : "max-h-[65vh]"
      } w-full flex-col overflow-hidden rounded-[14px] border border-border bg-card  ${
        fillHeight ? "2xl:flex" : ""
      }`}
    >
      <div
        className={`relative min-h-0 flex-1 overflow-x-auto overflow-y-auto custom-scrollbar table-scrollbar bg-[linear-gradient(to_bottom,#F0F0F0_0,#F0F0F0_57px,var(--border)_57px,var(--border)_58px,transparent_58px)] dark:bg-[linear-gradient(to_bottom,#1b2544_0,#1b2544_57px,var(--border)_57px,var(--border)_58px,transparent_58px)] ${
          fillHeight ? "2xl:flex-1" : ""
        }`}
      >
        <table
          className="w-max min-w-full border-collapse text-left"
        >
          <colgroup>
            {columns.map((column) => {
              const width = getFixedWidth(column);
              return <col key={column.key} style={width ? { width } : undefined} />;
            })}
          </colgroup>
          <TableHeader columns={columns} />
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`transition-colors duration-200 hover:bg-primary/5 ${
                  i === 0 ? "border-b border-border" : "border-b border-divider"
                } last:border-b-0`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-4 align-middle sm:px-5 sm:py-5 ${c.className ?? ""}`}
                  >
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[58px] flex items-center justify-center text-sm text-label"
          >
            No data found
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;