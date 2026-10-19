"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { type ReactNode } from "react";

type TogglableSwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
};

const SWITCH_SIZE = {
  sm: {
    label: "gap-2 text-xs",
    track: "h-5 w-9",
    thumb: "h-4 w-4 peer-checked:translate-x-4",
  },
  md: {
    label: "gap-3 text-sm",
    track: "h-6 w-11",
    thumb: "h-5 w-5 peer-checked:translate-x-5",
  },
} as const;

const TogglableSwitch = ({
  checked,
  defaultChecked,
  onChange,
  label,
  ariaLabel,
  id,
  disabled = false,
  className = "",
  size = "md",
}: TogglableSwitchProps) => (
  <label
    className={`flex items-center ${SWITCH_SIZE[size].label} text-heading ${
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
    } ${className}`}
  >
    <span className="relative inline-flex shrink-0">
      <RadioCheckButtonh
        id={id}
        type="checkbox"
        role="switch"
        aria-label={ariaLabel}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`${SWITCH_SIZE[size].track} rounded-full bg-divider transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 peer-disabled:opacity-60`}
      />
      <span
        className={`pointer-events-none absolute left-0.5 top-0.5 ${SWITCH_SIZE[size].thumb} rounded-full bg-card shadow transition-transform duration-200`}
      />
    </span>
    {label}
  </label>
);

export default TogglableSwitch;
