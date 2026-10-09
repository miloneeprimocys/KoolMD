"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookUser,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { FaShieldAlt } from "react-icons/fa";

type SubItem = { label: string; href: string; Icon: LucideIcon };

type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  children?: SubItem[];
  badge?: number; // red dot / count badge
};

/* ---------- Section groupings (matches the screenshot) ---------- */
type NavSection = {
  title?: string; // undefined = no section label (top group)
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    title: "PATIENTS & PROVIDERS",
    items: [
      { label: "Patients", href: "/patients", Icon: Users },
      { label: "Providers", href: "/providers", Icon: BookUser },
      { label: "Appointments", href: "/appointments", Icon: CalendarDays },
      { label: "Encounters", href: "/encounters", Icon: FileText },
      { label: "Prescriptions", href: "/prescriptions", Icon: Receipt },
      { label: "Referrals", href: "/referrals", Icon: Send },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Billing & Payments", href: "/billing", Icon: CreditCard },
      { label: "Reports", href: "/reports", Icon: ClipboardList },
      { label: "Messages", href: "/messages", Icon: MessageSquare, badge: 1 },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Staff Management", href: "/staff", Icon: UserCog },
      { label: "Settings", href: "/settings", Icon: Settings },
    ],
  },
];

/* ----- Shared link styles (blue accent) ----- */
const linkBase =
  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 " +
  "lg:gap-3.5 lg:px-3.5 lg:py-2.5 lg:text-[15px] " +
  "xl:gap-4 xl:px-4 xl:py-3 xl:text-base";

const linkIdle = "text-label hover:bg-primary/5 hover:text-primary";

const linkActive =
  "bg-primary/10 font-medium text-primary " +
  "before:absolute before:top-1/2 before:-left-3 lg:before:-left-4 before:h-[85%] before:w-[3px] " +
  "before:-translate-y-1/2 before:rounded-r-full before:bg-primary";

const Logo = ({ mini }: { mini?: boolean }) => (
  <Image
    src="/images/only_logo.svg"
    alt="KOOLMD Logo"
    width={mini ? 28 : 34}
    height={mini ? 28 : 34}
    className="shrink-0 lg:h-9 lg:w-9 xl:h-10 xl:w-10 2xl:h-11 2xl:w-11"
  />
);

/* ------------------------------------------------------------------ */
/*  Portal-based Tooltip                                              */
/* ------------------------------------------------------------------ */
type TooltipContent = { label: string; anchorRect: DOMRect };

const TooltipPortal = ({
  content,
  onMouseEnter,
  onMouseLeave,
}: {
  content: TooltipContent;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const { label, anchorRect } = content;
  const top = anchorRect.top + anchorRect.height / 2;
  const left = anchorRect.right + 12;

  return createPortal(
    <div
      className="fixed z-[9999] -translate-y-1/2 animate-in fade-in slide-in-from-left-2 duration-200"
      style={{ top, left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative">
        <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-b border-border bg-card" />
        <div className="whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-body shadow-xl lg:text-sm">
          {label}
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ------------------------------------------------------------------ */
/*  Main Sidebar                                                      */
/* ------------------------------------------------------------------ */
type MainSidebarProps = {
  isMini: boolean;
  onToggleMini: () => void;
};

const checkIsActive = (href: string, pathname: string | null) => {
  if (!pathname) return false;
  if (pathname === href) return true;

  if (href === "/providers") {
    return pathname === "/providers" || pathname.includes("provider");
  }

  if (href === "/patients") {
    return pathname === "/patients" || pathname.includes("patient");
  }

  if (href !== "/" && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return false;
};

const MainSidebar = ({ isMini, onToggleMini }: MainSidebarProps) => {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(
      SECTIONS.flatMap((s) => s.items)
        .filter((n) => n.children)
        .map((n) => [n.label, true])
    )
  );

  const [tooltip, setTooltip] = useState<TooltipContent | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

const handleToggleMini = () => {
  const next = !isMini; // what it will become
  onToggleMini();       // tell the parent

  // Re-open all groups whenever we expand back to full mode
  if (!next) {
    setOpenGroups(
      Object.fromEntries(
        SECTIONS.flatMap((s) => s.items)
          .filter((n) => n.children)
          .map((n) => [n.label, true])
      )
    );
  }
  setTooltip(null);
};

  const closeMobileSidebar = () => {
    const toggleInput = document.getElementById("sidebar-toggle") as HTMLInputElement | null;
    if (toggleInput) {
      toggleInput.checked = false;
    }
  };

  const showTooltip = useCallback((e: React.MouseEvent, label: string) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ label, anchorRect: rect });
  }, []);

  const hideTooltip = useCallback(() => {
    tooltipTimeout.current = setTimeout(() => setTooltip(null), 150);
  }, []);

  const keepTooltip = useCallback(() => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  }, []);

  return (
    <aside
      className={`group/sidebar fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300 ease-out -translate-x-full peer-checked:translate-x-0 lg:static lg:translate-x-0 ${
        isMini ? "w-[68px] lg:w-[80px]" : "w-64 lg:w-72 xl:w-80"
      }`}
    >
      {/* Logo + mobile close */}
      <div
        className={`flex h-14 shrink-0 items-center border-b border-border lg:h-16 ${
          isMini ? "justify-center px-2" : "justify-between px-5 lg:px-6"
        }`}
      >
        <div className={`flex items-center gap-2 lg:gap-3 ${isMini ? "justify-center" : ""}`}>
          <Logo mini={isMini} />
          {!isMini && (
            <p className="text-xl font-extrabold leading-none tracking-tight text-brand-navy lg:text-2xl">
              KOOL<span className="text-brand-teal">MD</span>
            </p>
          )}
        </div>
        {!isMini && (
          <label
            htmlFor="sidebar-toggle"
            aria-label="Close menu"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-body transition-colors hover:bg-primary/5 hover:text-primary lg:hidden"
          >
            <X className="h-4 w-4" />
          </label>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`hide-scrollbar flex-1 overflow-y-auto py-4 lg:py-5 ${
          isMini ? "px-2" : "px-3 lg:px-4"
        }`}
      >
        {SECTIONS.map((section, sIdx) => (
          <div key={section.title ?? `section-${sIdx}`} className={sIdx > 0 ? "mt-5" : ""}>
            {/* Section label */}
            {section.title && !isMini && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-placeholder lg:text-[11px]">
                {section.title}
              </p>
            )}
            {section.title && isMini && sIdx > 0 && (
              <div className="mx-auto mb-2 h-px w-8 bg-divider" aria-hidden="true" />
            )}

            <div className="space-y-1 lg:space-y-1.5">
              {section.items.map(({ label, href, Icon, children, badge }) => {
                const isActive = checkIsActive(href, pathname);

                /* ---- Simple item ---- */
                if (!children) {
                  return (
                    <div key={label} className="relative">
                      <Link
                        href={href}
                        onClick={closeMobileSidebar}
                        onMouseEnter={(e) => isMini && showTooltip(e, label)}
                        onMouseLeave={hideTooltip}
                        className={`${linkBase} ${isActive ? linkActive : linkIdle} ${
                          isMini ? "justify-center px-2" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 lg:h-[18px] lg:w-[18px] xl:h-5 xl:w-5" />
                        {!isMini && <span className="truncate">{label}</span>}

                       {/* Badge (red dot with count) */}
{badge != null && (
  <span
    className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold text-on-primary ${
      isMini ? "absolute right-1 top-1 h-2 w-2 min-w-0 p-0" : ""
    }`}
  >
    {badge}
  </span>
)}
                      </Link>
                    </div>
                  );
                }

                /* ---- Group with children ---- */
                const isOpen = isMini || !!openGroups[label];

                return (
                  <div key={label} className="relative">
                    <button
                      type="button"
                      onClick={() => !isMini && toggle(label)}
                      aria-expanded={isOpen}
                      aria-controls={`submenu-${label}`}
                      onMouseEnter={(e) => isMini && showTooltip(e, label)}
                      onMouseLeave={hideTooltip}
                      className={`${linkBase} ${linkIdle} cursor-pointer text-left ${
                        isMini ? "justify-center px-2" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 lg:h-[18px] lg:w-[18px] xl:h-5 xl:w-5" />
                      {!isMini && (
                        <>
                          <span>{label}</span>
                          <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform duration-300 ease-in-out lg:h-[18px] lg:w-[18px] ${
                              isOpen ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {!isMini && (
                      <div
                        id={`submenu-${label}`}
                        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-in-out ${
                          isOpen
                            ? "visible grid-rows-[1fr] opacity-100"
                            : "invisible grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="ml-5 mt-1 space-y-1 border-l border-divider pl-2 lg:ml-6 lg:mt-1.5 lg:space-y-1.5 lg:pl-3">
                            {children.map((c) => {
                              const isSubActive = checkIsActive(c.href, pathname);
                              return (
                                <Link
                                  key={c.label}
                                  href={c.href}
                                  onClick={closeMobileSidebar}
                                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 lg:gap-3.5 lg:px-3.5 lg:py-2.5 lg:text-sm ${
                                    isSubActive
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-label/90 hover:bg-primary/5 hover:text-primary"
                                  }`}
                                >
                                  <c.Icon className="h-4 w-4 shrink-0 lg:h-[17px] lg:w-[17px]" />
                                  {c.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {isMini && (
                      <div className="mt-1 flex flex-col items-center gap-1 lg:mt-1.5 lg:gap-1.5">
                        {children.map((c) => {
                          const isSubActive = checkIsActive(c.href, pathname);
                          return (
                            <Link
                              key={c.label}
                              href={c.href}
                              onClick={closeMobileSidebar}
                              onMouseEnter={(e) => showTooltip(e, c.label)}
                              onMouseLeave={hideTooltip}
                              className={`${linkBase} ${
                                isSubActive ? linkActive : linkIdle
                              } justify-center px-2`}
                            >
                              <c.Icon className="h-4 w-4 shrink-0 lg:h-[18px] lg:w-[18px] xl:h-5 xl:w-5" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

         {/* HIPAA compliance card (bottom) */}
      {!isMini && (
        <div className="shrink-0   pt-2">
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center  text-primary">
              <FaShieldAlt  className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-heading lg:text-sm">
                HIPAA Compliant
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-body lg:text-[11px]">
                Secure. Private. Protected.
              </p>
            </div>
          </div>
        </div>
      )}

      </nav>

     
      {/* Mini mode toggle */}
     <button
  type="button"
  onClick={handleToggleMini}
        aria-label={isMini ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-14 z-50 hidden h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:border-primary hover:text-primary lg:top-16 lg:flex lg:h-7 lg:w-7"
      >
        {isMini ? (
          <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        )}
      </button>

      {/* Tooltip */}
      {tooltip && (
        <TooltipPortal
          content={tooltip}
          onMouseEnter={keepTooltip}
          onMouseLeave={hideTooltip}
        />
      )}
    </aside>
  );
};

export default MainSidebar;