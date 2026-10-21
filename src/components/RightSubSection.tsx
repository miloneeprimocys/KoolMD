"use client";

import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RightSubSectionProps = {
  children: (closePanel: () => void) => ReactNode;
  onClose?: () => void;
  onCloseStart?: () => void;
  initiallyOpen?: boolean;
  /** Controlled visibility for panels that stay mounted while closed. */
  open?: boolean;
  /** Reopen/reset the close animation when the active record changes. */
  reopenKey?: string | number;
  desktopLayoutControlled?: boolean;
  width?: number;
  ariaLabel: string;
  className?: string;
  onHeightChange?: (height: number) => void;
};

const RightSubSection = ({
  children,
  onClose,
  onCloseStart,
  initiallyOpen = false,
  open,
  reopenKey,
  desktopLayoutControlled = false,
  width = 360,
  ariaLabel,
  className = "",
  onHeightChange,
}: RightSubSectionProps) => {
  const panelRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(open ?? initiallyOpen);
  const [isClosing, setIsClosing] = useState(false);
  const visible = isOpen && !isClosing;

  useEffect(() => {
    if (open !== undefined) {
      if (open && closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsOpen(open);
      if (open) setIsClosing(false);
      return;
    }

    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open, reopenKey]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!panelRef.current) return;

    const panel = panelRef.current;
    const updateHeight = () => {
      const height = Math.ceil(panel.getBoundingClientRect().height);
      onHeightChange?.(height);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    updateHeight();
    return () => observer.disconnect();
  }, [onHeightChange]);

  const closePanel = () => {
    if (!onClose || closeTimer.current) return;
    setIsClosing(true);
    onCloseStart?.();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      if (open === undefined) setIsOpen(false);
      onClose();
    }, duration);
  };

  const widthStyle = { "--right-subsection-width": `${width}px` } as CSSProperties;

  return (
    <>
      {onClose && (
        <div
          className={`fixed inset-x-0 bottom-0 top-14 z-[140] bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out xl:top-16 2xl:hidden ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={closePanel}
          aria-hidden="true"
        />
      )}
      <div
        style={widthStyle}
        className={`contents 2xl:relative 2xl:block 2xl:shrink-0 2xl:overflow-hidden 2xl:transition-[width] 2xl:duration-300 2xl:ease-out ${
          desktopLayoutControlled
            ? "2xl:w-[var(--right-subsection-width)]"
            : visible
              ? "2xl:w-[var(--right-subsection-width)]"
              : "2xl:w-0"
        } ${visible ? "2xl:h-auto" : "2xl:h-0"}`}
      >
        <aside
          ref={panelRef}
          aria-label={ariaLabel}
          style={{ ...widthStyle, maxWidth: `${width}px` }}
          className={`fixed right-0 top-14 z-[150] flex h-[calc(100dvh-3.5rem)] w-full max-w-[420px] flex-col overflow-y-auto border-y border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out xl:top-16 xl:h-[calc(100dvh-4rem)] 2xl:relative 2xl:bottom-auto 2xl:right-auto 2xl:top-auto 2xl:z-auto 2xl:h-auto 2xl:w-[var(--right-subsection-width)] 2xl:max-w-none 2xl:shrink-0 2xl:rounded-[14px] 2xl:border-[1.5px] 2xl:shadow-none 2xl:transition-transform 2xl:duration-300 2xl:ease-out hide-scrollbar ${visible ? "translate-x-0" : "translate-x-full"} ${className}`}
        >
          {children(closePanel)}
        </aside>
      </div>
    </>
  );
};

export default RightSubSection;
