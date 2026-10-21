import React, { useMemo, useState } from "react";

import TableHeader, { type TableColumn } from "./Tableheader";

type TableProps = {
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
  fillHeight?: boolean;
  bordered?: boolean;
  selectable?: boolean;
};

const Table = ({
  columns,
  rows,
  fillHeight = false,
  bordered = true,
  selectable = false,
}: TableProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const rowKeys = useMemo(
    () =>
      rows.map((row, index) => {
        const checkbox = row.select;
        if (React.isValidElement<{ "aria-label"?: string }>(checkbox)) {
          const label = checkbox.props["aria-label"];
          if (label) return label;
        }
        return `row-${index}`;
      }),
    [rows],
  );
  const allRowsSelected =
    selectable && rowKeys.length > 0 && rowKeys.every((key) => selectedRowKeys.has(key));
  const someRowsSelected =
    selectable && rowKeys.some((key) => selectedRowKeys.has(key)) && !allRowsSelected;

  const setAllRowsSelected = (checked: boolean) => {
    setSelectedRowKeys((current) => {
      const next = new Set(current);
      rowKeys.forEach((key) => (checked ? next.add(key) : next.delete(key)));
      return next;
    });
  };

  const getFixedWidth = (column: TableColumn) =>
    column.width ?? (column.className?.split(/\s+/).includes("w-10") ? 40 : undefined);

  return (
    <div
      className={`flex ${
        rows.length === 0 ? "h-[65vh]" : "max-h-[65vh]"
      } w-full flex-col overflow-hidden rounded-[14px] bg-card ${
        bordered ? "border border-border" : ""
      } ${
        fillHeight ? "2xl:flex" : ""
      }`}
    >
      <div
        className={`relative min-h-0 flex-1 overflow-x-auto overflow-y-auto custom-scrollbar table-scrollbar bg-[linear-gradient(to_bottom,#f1f6fc_0,#f1f6fc_57px,var(--border)_57px,var(--border)_58px,transparent_58px)] dark:bg-[linear-gradient(to_bottom,#0b2f5e,#0b2f5e_57px,var(--border)_57px,var(--border)_58px,transparent_58px)] ${
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
          <TableHeader
            columns={columns}
            selectAll={
              selectable
                ? {
                    checked: allRowsSelected,
                    indeterminate: someRowsSelected,
                    onChange: setAllRowsSelected,
                  }
                : undefined
            }
          />
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-divider transition-colors duration-200 last:border-b-0 dark:hover:bg-primary/5 hover:bg-primary/3"
              >

                {columns.map((c) => {
                  const cell = row[c.key];
                  const rowKey = rowKeys[i];
                  const selectionCell =
                    selectable &&
                    c.key === "select" &&
                    React.isValidElement<React.InputHTMLAttributes<HTMLInputElement>>(cell) &&
                    cell.type === "input"
                      ? React.cloneElement(cell, {
                          checked: selectedRowKeys.has(rowKey),
                          onChange: () =>
                            setSelectedRowKeys((current) => {
                              const next = new Set(current);
                              if (next.has(rowKey)) next.delete(rowKey);
                              else next.add(rowKey);
                              return next;
                            }),
                        })
                      : cell;

                  return (
                    <td
                      key={c.key}
                      className={`px-4 py-4 align-middle sm:px-5 sm:py-5 ${c.className ?? ""}`}
                    >
                      {selectionCell}
                    </td>
                  );
                })}
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