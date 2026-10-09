"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { selectAuthRequest, selectCurrentUser } from "@/redux/selectors/authSelectors";
import { logoutUser } from "@/redux/thunks/authThunks";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  PRACTITIONER: "Provider",
  PRACTITIONER_APPLICANT: "Provider (pending approval)",
  RECEPTIONIST: "Receptionist",
  STAFF: "Staff",
  PATIENT: "Patient",
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

/** Reads the signed-in user straight from the store — no props passed down from the layout. */
const UserMenu = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const logoutRequest = useAppSelector(selectAuthRequest("logout"));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  if (!currentUser) return null;

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  const primaryRoleLabel = ROLE_LABELS[currentUser.roleCodes[0]] ?? currentUser.roleCodes[0] ?? "";
  const isSigningOut = logoutRequest.status === "pending";

  return (
    <div ref={menuContainerRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-primary/5"
      >
        {/* Avatar */}
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-end text-xs font-semibold text-heading ring-1 ring-border">
          {getInitials(currentUser.firstName, currentUser.lastName)}
        </span>

        {/* Name + role — large screens only */}
        <div className="hidden text-left leading-tight lg:block">
          <p className="text-xs font-semibold text-heading">{fullName}</p>
          <p className="text-[10px] text-body">{primaryRoleLabel}</p>
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 text-body transition-transform lg:block ${isMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-shape-sky/20"
        >
          <div className="border-b border-divider px-4 py-3">
            <p className="truncate text-sm font-semibold text-heading">{fullName}</p>
            <p className="truncate text-xs text-body">{currentUser.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => dispatch(logoutUser())}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
