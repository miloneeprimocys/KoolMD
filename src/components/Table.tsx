import React from "react";

import TableHeader, { type TableColumn } from "./Tableheader";

type TableProps = {
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
  fillHeight?: boolean;
};

const Table = ({ columns, rows, fillHeight = false }: TableProps) => {
  return (
    <div
      className={`flex h-full w-full flex-col rounded-[14px] border border-border bg-card ${
        fillHeight ? "2xl:flex" : ""
      }`}
    >
      <div
        className={`hide-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-[14px] ${
          fillHeight ? "2xl:flex-1" : ""
        }`}
      >
        <table className="w-full min-w-[860px] border-collapse text-left">
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
      </div>
    </div>
  );
};

export default Table;