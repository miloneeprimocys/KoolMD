"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarClock, CalendarX, Clock, DollarSign, FileText, RefreshCw, Tag as TagIcon } from "lucide-react";
import AddButton from "@/components/Addbutton";
import EditButton from "@/components/EditButton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import CommonRightSection from "@/components/CommonRightSection";
import { PlanIcon, formatDate, formatPerPeriod } from "../membership-plans/Viewmembershipplan";
import type { HistoryEntry } from "./Membershiphistory";

const CANCEL_ROUTE = "/membership/history/cancel";

type Props = { plan: HistoryEntry | null; onClose: () => void; onCloseStart: () => void };

const Plans = ({ plan, onClose, onCloseStart }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!plan) return;
    setClosing(false);
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [plan?.id]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setOpen(false);
    onCloseStart();
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (!plan) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!plan) return null;
  const active = plan.status === "Active";

  return (
    <CommonRightSection
      label={`${plan.name} details`}
      ariaModal
      open={open}
      closing={closing}
      onClose={close}
      panelClassName="2xl:max-w-[460px]"
      header={<h2 className="text-base font-semibold text-heading">{plan.name}</h2>}
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        <section className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <PlanIcon icon={plan.icon} size="h-12 w-12" rounded="rounded-full" />
            <div className="min-w-0 space-y-1">
              <h3 className="font-semibold text-heading">{plan.name}</h3>
              <Tags text={plan.status} tone={active ? "success" : plan.status === "Cancelled" ? "danger" : "neutral"} />
              <p className="text-xs text-body">{plan.description}</p>
            </div>
          </div>
          <div className="shrink-0 border-l border-divider pl-3 text-right">
            <p className="font-bold text-heading">{formatPerPeriod(plan.price, plan.cycle)}</p>
            <p className="text-xs text-body">Billed {plan.cycle === "Monthly" ? "monthly" : "yearly"}</p>
          </div>
        </section>

        {active && (
          <div className="grid grid-cols-2 gap-3">
            <AddButton text="Edit Plan" icon={null} onClick={() => { }} />
            <ImportButton
              text="Cancel Plan"
              icon={null}
              onClick={() => router.push(`${CANCEL_ROUTE}?id=${encodeURIComponent(plan.id)}`)}
              className="w-full"
            />
          </div>
        )}

        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Plan Information</h3>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-primary/[0.03] p-4">
            <Info icon={TagIcon} label="Plan Name">{plan.name}</Info>
            <Info icon={Calendar} label="Start Date">{formatDate(plan.start)}</Info>
            <Info icon={Clock} label="Status"><Tags text={plan.status} tone={active ? "success" : plan.status === "Cancelled" ? "danger" : "neutral"} /></Info>
            <Info icon={CalendarX} label="End Date">{formatDate(plan.end)}</Info>
            <Info icon={DollarSign} label="Price">{formatPerPeriod(plan.price, plan.cycle)}</Info>
            <Info icon={RefreshCw} label="Auto Renewal"><Tags text={active ? "Enabled" : "Disabled"} tone={active ? "success" : "neutral"} /></Info>
            <Info icon={CalendarClock} label="Billing Cycle">{plan.cycle}</Info>
            <Info icon={FileText} label="Description">{plan.description}</Info>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-heading">Membership Timeline</h3>
          <ol className="space-y-3">
            <li className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-success" /><div><p className="text-sm font-medium text-heading">Plan {active ? "Activated" : plan.status}</p><p className="text-xs text-body">{plan.name} · {formatDate(plan.start)}</p></div></li>
            <li className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /><div><p className="text-sm font-medium text-heading">Payment Successful</p><p className="text-xs text-body">{formatPerPeriod(plan.price, plan.cycle)}</p></div></li>
          </ol>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-heading">Payment History</h3><EditButton section="Payment History" variant="viewAll" onEdit={() => { }} /></div>
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-xs"><thead><tr className="border-b border-border text-body"><th className="p-2">Date</th><th className="p-2">Transaction ID</th><th className="p-2">Amount</th><th className="p-2">Status</th></tr></thead><tbody><tr><td className="p-2">{formatDate(plan.start)}</td><td className="p-2">TXN{plan.id.toUpperCase()}</td><td className="p-2">${plan.price.toFixed(2)}</td><td className="p-2"><Tags text="Success" tone="success" /></td></tr></tbody></table></div>
        </section>
      </div>
    </CommonRightSection>
  );
};

const Info = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-body" /><div><p className="text-xs text-body">{label}</p><div className="mt-0.5 break-words text-sm font-medium text-heading">{children}</div></div></div>
);

export default Plans;
