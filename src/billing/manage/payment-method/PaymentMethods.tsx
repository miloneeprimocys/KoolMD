"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CheckCircle2, ArrowLeftRight, DollarSign, Users, Settings, SquarePen, Eye, Star, Ban,
  Trash2, ChevronUp, ChevronDown, Info, CreditCard, Landmark, HeartPulse, ShieldCheck,
  Banknote, Wallet,
} from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import TogglableSwitch from "@/components/Togglableswitch";
import Breadcrumb from "@/components/Breadcrumb";
import ViewPaymentMethod from "./ViewPaymentMethod";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { clearDeletedPaymentMethodId, showDeletePaymentMethod } from "@/redux/slices/dialogslice";
export type Method = {
  id: string;
  name: string;
  sub: string;
  Icon: React.ElementType;
  iconCls: string;
  description: string;
  fee: string;
  active: boolean;
};

const INITIAL: Method[] = [
  { id: "1", name: "Credit Card", sub: "Visa, Mastercard, American Express, Discover", Icon: CreditCard, iconCls: "bg-primary/10 text-primary", description: "Accept payments via credit and debit cards", fee: "2.9% + $0.30", active: true },
  { id: "2", name: "ACH Transfer", sub: "Direct bank transfer", Icon: Landmark, iconCls: "bg-primary/10 text-primary", description: "Accept payments via ACH bank transfer", fee: "1.0% (max $5.00)", active: true },
  { id: "3", name: "HSA/FSA", sub: "Health Savings & Flexible Spending", Icon: HeartPulse, iconCls: "bg-danger/10 text-danger", description: "Accept HSA/FSA card payments", fee: "2.9% + $0.30", active: true },
  { id: "4", name: "Insurance Payment", sub: "Direct insurance billing", Icon: ShieldCheck, iconCls: "bg-success/10 text-success", description: "Accept payments from insurance providers", fee: "No fee", active: true },
  { id: "5", name: "Cash", sub: "In-person payments", Icon: Banknote, iconCls: "bg-warning/10 text-warning", description: "Manual cash payments (recorded)", fee: "No fee", active: true },
  { id: "6", name: "Check", sub: "Paper check payments", Icon: SquarePen, iconCls: "bg-primary/10 text-primary", description: "Manual check payments (recorded)", fee: "No fee", active: false },
  { id: "7", name: "Apple Pay, Google Pay", sub: "Digital wallet payments", Icon: Wallet, iconCls: "bg-primary/10 text-primary", description: "Accept payments via Apple Pay or Google Pay", fee: "2.9% + $0.30", active: false },
  { id: "8", name: "Patient Portal", sub: "Saved payment methods", Icon: Users, iconCls: "bg-danger/10 text-danger", description: "Allow patients to pay via saved methods", fee: "Varies by method", active: true },
];


const MENU_ITEMS = [
  { key: "edit", label: "Edit", Icon: SquarePen },
  { key: "view", label: "View Details", Icon: Eye },
  { key: "default", label: "Set as Default", Icon: Star },
  { key: "toggle", label: "Disable", Icon: Ban },
  { key: "delete", label: "Delete", Icon: Trash2 },
] as const;

const PaymentMethods = () => {
  const dispatch = useAppDispatch();
  const deletedPaymentMethodId = useAppSelector((state) => state.dialog.deletedPaymentMethodId);
  const [methods, setMethods] = useState<Method[]>(INITIAL);
  const [defaultId, setDefaultId] = useState("1");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<"above" | "below">("below");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selected = methods.find((m) => m.id === viewId) ?? null;

  useEffect(() => {
    if (selected) setIsPanelClosing(false);
  }, [selected]);

  useEffect(() => {
    if (!deletedPaymentMethodId) return;
    const id = deletedPaymentMethodId;
    const remaining = methods.filter((method) => method.id !== id);
    setMethods(remaining);
    setDefaultId((currentDefaultId) => currentDefaultId === id ? remaining[0]?.id ?? "" : currentDefaultId);
    if (viewId === id) setViewId(null);
    dispatch(clearDeletedPaymentMethodId());
  }, [deletedPaymentMethodId, dispatch, methods, viewId]);
  useLayoutEffect(() => {
    const trigger = menuRef.current;
    const menu = menuPanelRef.current;
    if (!openMenuId || !trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = menu.getBoundingClientRect().height;
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    setMenuPlacement(spaceBelow < menuHeight && spaceAbove > spaceBelow ? "above" : "below");
  }, [openMenuId]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const activeCount = methods.filter((m) => m.active).length;
  const defaultName = methods.find((m) => m.id === defaultId)?.name ?? "—";

  const stats: StatItem[] = [
    { label: "Active Methods", value: String(activeCount), Icon: CheckCircle2, accent: "success", tag: { text: "Accepting payments", tone: "neutral" } },
    { label: "Total Transactions", value: "1,248", Icon: ArrowLeftRight, accent: "primary", tag: { text: "Last 30 days", tone: "neutral" } },
    { label: "Total Amount", value: "$28,450.00", Icon: DollarSign, accent: "violet", tag: { text: "Last 30 days", tone: "neutral" } },
    { label: "Preferred Method", value: defaultName, Icon: Users, accent: "danger", tag: { text: "Most used by patients", tone: "neutral" } },
  ];

  const setActive = (id: string, active: boolean) =>
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));

  const move = (index: number, dir: -1 | 1) =>
    setMethods((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleMenu = (key: string, m: Method) => {
    if (key === "default") setDefaultId(m.id);
    else if (key === "toggle") setActive(m.id, !m.active);
    else if (key === "view") setViewId(m.id);
    else if (key === "delete") {
      dispatch(showDeletePaymentMethod({
        method: { id: m.id, name: m.name, description: m.description, fee: m.fee, active: m.active },
        isDefault: m.id === defaultId,
      }));
    }
    setOpenMenuId(null);
  };

  const columns: TableColumn[] = [
    { key: "method", label: "Method" },
    { key: "description", label: "Description" },
    { key: "fee", label: "Transaction Fee" },
    { key: "status", label: "Status" },
    { key: "order", label: "Display Order" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = methods.map((m, index) => ({
      method: (
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.iconCls}`}>
          <m.Icon className="h-4 w-4" />
        </span>
        <Content title={m.name} description={m.sub} />
      </div>
    ),
    description: <Content title={m.description} />,
    fee: <Content title={m.fee} />,
    status: (
      <div className="flex items-center gap-2">
        <TogglableSwitch
          size="sm"
          checked={m.active}
          ariaLabel={`Toggle ${m.name}`}
          onChange={(checked) => setActive(m.id, checked)}
        />
        <Tags text={m.active ? "Active" : "Inactive"} tone={m.active ? "success" : "neutral"} />
        {m.id === defaultId && <Tags text="Default" tone="info" />}
      </div>
    ),
       order: (
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium text-heading">
          {index + 1}
        </span>
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Move up"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            className="cursor-pointer text-label hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            onClick={() => move(index, 1)}
            disabled={index === methods.length - 1}
            className="cursor-pointer text-label hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    ),
    actions: (
      <div
        className="relative flex w-full items-center justify-center"
        ref={openMenuId === m.id ? menuRef : undefined}
      >
        <Actions
          actions={["more"]}
          onAction={() => setOpenMenuId((cur) => (cur === m.id ? null : m.id))}
        />
        {openMenuId === m.id && (
          <div
            ref={menuPanelRef}
            className={`absolute right-0 z-30 w-44 rounded-lg border border-border bg-card py-1 shadow-lg ${
              menuPlacement === "above" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {MENU_ITEMS.map(({ key, label, Icon }) => {
              const isDelete = key === "delete";
              const text = key === "toggle" ? (m.active ? "Disable" : "Enable") : label;
              return (
                <React.Fragment key={key}>
                  {isDelete && <div className="my-1 border-t border-border" />}
                  <button
                    type="button"
                    onClick={() => handleMenu(key, m)}
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                      isDelete ? "text-danger hover:bg-danger/10" : "text-heading hover:bg-primary/5"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isDelete ? "" : "text-primary"}`} />
                    {text}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="relative w-full">
    <div
      className={`mx-auto w-full min-w-0 max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
        selected && !isPanelClosing ? "2xl:pr-[460px]" : ""
      }`}
    >
      <Breadcrumb items={[{ label: "Billing", href: "/payment/payment-gateway" }, { label: "Payment Methods" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Payment Methods</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage accepted payment methods for patient payments, invoices and memberships.
          </p>
        </div>
        <AddButton text="Add Payment Method" onClick={() => {}} />
      </div>

      <StatCards stats={stats} truncateContent={Boolean(selected)} />

      <div className="rounded-[14px] border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <h3 className="text-base font-semibold text-heading sm:text-lg">Payment Methods</h3>
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-heading transition-colors hover:bg-primary/5"
          >
            <Settings className="h-4 w-4" />
            Configure Settings
          </button>
        </div>

        {/* overflow-visible so the dropdown isn't clipped */}
        <div className="overflow-visible">
          <Table columns={columns} rows={rows} bordered={false} />
        </div>

        <div className="m-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3 text-sm text-primary sm:m-5">
          <Info className="h-4 w-4 shrink-0" />
          Payment methods that are active will be available for patient payments, invoices and membership purchases.
        </div>
      </div>
    </div>

    <ViewPaymentMethod
      method={selected}
      order={selected ? methods.findIndex((m) => m.id === selected.id) + 1 : 0}
      isDefault={selected?.id === defaultId}
      onClose={() => setViewId(null)}
      onCloseStart={() => setIsPanelClosing(true)}
      onToggleActive={setActive}
      onSetDefault={setDefaultId}
    />

    </div>
  );
};

export default PaymentMethods;
