"use client";

import { useState } from "react";

export const useTableSelection = (rowKeys: readonly string[]) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const selectedCount = rowKeys.filter((key) => selectedKeys.has(key)).length;
  const allSelected = rowKeys.length > 0 && selectedCount === rowKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleRow = (key: string) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (allSelected) rowKeys.forEach((key) => next.delete(key));
      else rowKeys.forEach((key) => next.add(key));
      return next;
    });
  };

  return { selectedKeys, allSelected, someSelected, toggleRow, toggleAll };
};

export const TableSelectAllCheckbox = ({
  checked,
  indeterminate,
  onChange,
  className,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  className: string;
}) => (
  <input
    type="checkbox"
    checked={checked}
    ref={(element) => {
      if (element) element.indeterminate = indeterminate;
    }}
    onChange={onChange}
    aria-label="Select all"
    className={className}
  />
);
