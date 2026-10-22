"use client";

import React, { type ReactNode } from "react";

type DisconnectButtonProps = {
  text: string;
  icon?: ReactNode | null;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

/** Shared outlined danger action for disconnecting, cancelling, or rejecting. */
const DisconnectButton = ({
  text,
  icon,
  onClick,
  className = "",
  disabled = false,
}: DisconnectButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-danger/40 bg-danger/5 px-5 text-sm font-medium text-danger transition-colors hover:border-danger/50 hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default DisconnectButton;
