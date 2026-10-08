"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";

export interface ErrorToastProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Callback fired when toast closes */
  onClose: () => void;
  /** Toast heading / title */
  title?: string;
  /** Descriptive message */
  message?: string;
  /** Auto-dismiss duration in ms (default: 5000). Set to 0 to disable */
  duration?: number;
  /** Optional CTA action button (e.g. "Retry") */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  isOpen,
  onClose,
  title = "Something went wrong",
  message,
  duration = 5000,
  action,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);
  const timerStartRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setIsRendered(false);
      onClose();
    }, 280);
  };

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);
      remainingTimeRef.current = duration;
      timerStartRef.current = Date.now();

      if (duration > 0) {
        timeoutIdRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    } else {
      if (isRendered && !isExiting) {
        handleClose();
      }
    }

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [isOpen, duration]);

  const handleMouseEnter = () => {
    if (duration <= 0 || isExiting) return;
    setIsPaused(true);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (timerStartRef.current) {
      const elapsed = Date.now() - timerStartRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    if (duration <= 0 || isExiting) return;
    setIsPaused(false);
    timerStartRef.current = Date.now();
    timeoutIdRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);
  };

  if (!mounted || !isRendered) return null;

  const content = (
    <div
      aria-live="assertive"
      role="alert"
      className="fixed top-5 right-5 z-[9999] flex w-[calc(100vw-2.5rem)] max-w-md flex-col pointer-events-auto"
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`group relative isolate overflow-hidden rounded-2xl border border-danger/30 bg-card/95 p-4 shadow-[0_16px_48px_-8px_rgba(229,72,77,0.18)] backdrop-blur-md transition-all duration-300 dark:border-danger/40 dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.6)] ${
          isExiting ? "animate-toast-out" : "animate-toast-in"
        }`}
      >
        {/* Decorative left accent gradient in danger color */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-danger via-warning to-danger"
        />

        {/* Ambient subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-danger/10 blur-2xl dark:bg-danger/15"
        />

        <div className="flex items-start gap-3.5 pl-1.5">
          {/* Animated Icon badge */}
          <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger ring-1 ring-danger/25 dark:bg-danger/15 dark:ring-danger/30">
            {/* Ripple wave */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-xl bg-danger/20 animate-toast-ripple"
            />
            <AlertCircle className="relative h-5 w-5 animate-toast-icon" strokeWidth={2.2} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h4 className="text-sm font-semibold tracking-tight text-heading">
              {title}
            </h4>
            {message && (
              <p className="mt-1 text-xs leading-relaxed text-body break-words">
                {message}
              </p>
            )}

            {action && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    handleClose();
                  }}
                  className="inline-flex cursor-pointer items-center text-xs font-semibold text-danger transition-colors hover:text-danger/80 hover:underline"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close error notification"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-heading/5 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar (if duration is set) */}
        {duration > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-divider/40">
            <div
              className="h-full bg-gradient-to-r from-danger to-warning transition-all"
              style={{
                animation: `toastProgress ${duration}ms linear forwards`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ErrorToast;
