"use client";

import React from "react";
import {
  Award,
  Calendar,
  Check,
  Clock,
  Crown,
  DollarSign,
  FileText,
  Gem,
  GraduationCap,
  Heart,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag as TagIcon,
  Users,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import ModalShell from "@/components/Modalshell";


/* ---------------------------------------------------------------- */
/*  Shared plan primitives — imported by the other membership files  */
/* ---------------------------------------------------------------- */
export type IconKey =
  | "crown"
  | "gem"
  | "users"
  | "heart"
  | "leaf"
  | "graduation"
  | "star"
  | "shield"
  | "award"
  | "sparkles";

export const PLAN_ICON: Record<IconKey, { icon: LucideIcon; tone: string }> = {
  crown: { icon: Crown, tone: "bg-warning/15 text-warning" },
  gem: { icon: Gem, tone: "bg-violet/15 text-violet" },
  users: { icon: Users, tone: "bg-primary/15 text-primary" },
  heart: { icon: Heart, tone: "bg-pink/15 text-pink" },
  leaf: { icon: Leaf, tone: "bg-success/15 text-success" },
  graduation: { icon: GraduationCap, tone: "bg-violet/15 text-violet" },
  star: { icon: Star, tone: "bg-warning/15 text-warning" },
  shield: { icon: ShieldCheck, tone: "bg-primary/15 text-primary" },
  award: { icon: Award, tone: "bg-pink/15 text-pink" },
  sparkles: { icon: Sparkles, tone: "bg-success/15 text-success" },
};

/** Icons shown in the picker by default / after pressing "…". */
export const MAIN_ICONS: IconKey[] = ["crown", "gem", "users", "heart", "leaf"];
export const EXTRA_ICONS: IconKey[] = ["graduation", "star", "shield", "award", "sparkles"];

export const PlanIcon = ({
  icon,
  size = "h-10 w-10",
  iconSize = "h-5 w-5",
  rounded = "rounded-xl",
}: {
  icon: IconKey;
  size?: string;
  iconSize?: string;
  rounded?: string;
}) => {
  const { icon: Icon, tone } = PLAN_ICON[icon];
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center ${rounded} ${tone}`}>
      <Icon className={iconSize} />
    </span>
  );
};

export type PlanType = "Individual" | "Family" | "Corporate";

/* ---------------------------------------------------------------- */
/*  Formatting helpers                                               */
/* ---------------------------------------------------------------- */
export type BillingCycle = "Monthly" | "Yearly" | "Annual";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-01-01" → "Jan 1, 2024" ("" → "–") */
export const formatDate = (iso: string) => {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

export const cycleUnit = (cycle: BillingCycle) => (cycle === "Monthly" ? "month" : "year");

/** 49 → "$49.00" */
export const formatPrice = (price: number) => `$${price.toFixed(2)}`;

/** 49, Monthly → "$49 / month" */
export const formatPerPeriod = (price: number, cycle: BillingCycle) =>
  `$${Number.isInteger(price) ? price : price.toFixed(2)} / ${cycleUnit(cycle)}`;

/* ---------------------------------------------------------------- */
/*  Membership plans (list + view modal)                             */
/* ---------------------------------------------------------------- */
export type PlanStatus = "Active" | "Inactive";

export type MembershipPlan = {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  price: number;
  cycle: BillingCycle;
  status: PlanStatus;
  members: number;
  icon: IconKey;
  benefits: string[];
  startDate: string; // ISO
};


const DetailRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-[20px_110px_minmax(0,1fr)] items-start gap-3 border-b border-divider py-3 last:border-b-0 sm:grid-cols-[20px_120px_minmax(0,1fr)]">
    <Icon className="mt-0.5 h-4 w-4 text-body" />
    <dt className="text-sm text-body">{label}</dt>
    <dd className="min-w-0 text-sm font-medium text-heading">{children}</dd>
  </div>
);

const ViewMembershipPlanModal = ({
  open,
  plan,
  onClose,
  onEdit,
  onToggleStatus,
}: {
  open: boolean;
  plan: MembershipPlan | null;
  onClose: () => void;
  onEdit: (plan: MembershipPlan) => void;
  /** Deactivate (when active) or activate (when inactive). */
  onToggleStatus: (plan: MembershipPlan) => void;
}) => {
  if (!plan) return null;

  const active = plan.status === "Active";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="View Membership Plan"
      width={860}
      footer={
        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <ImportButton
            text={active ? "Deactivate" : "Activate"}
            icon={null}
            onClick={() => onToggleStatus(plan)}
          />
          <AddButton text="Edit Plan" icon={null} onClick={() => onEdit(plan)} />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="flex flex-col gap-4 rounded-xl border border-primary/15 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
              <PlanIcon icon={plan.icon} size="h-11 w-11" iconSize="h-6 w-6" rounded="rounded-full" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-semibold text-heading">{plan.name}</h4>
                <Tags text={plan.status} tone={active ? "success" : "neutral"} />
              </div>
              <p className="mt-1 text-sm text-body">{plan.description}</p>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-2xl font-bold text-heading">
              ${plan.price}
              <span className="text-lg font-semibold"> / {cycleUnit(plan.cycle)}</span>
            </p>
            <p className="text-xs text-body">Billed {plan.cycle === "Monthly" ? "monthly" : "yearly"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Plan details */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-1 text-sm font-semibold text-heading">Plan Details</h4>
            <dl>
              <DetailRow icon={TagIcon} label="Plan Name">
                {plan.name}
              </DetailRow>
              <DetailRow icon={Clock} label="Status">
                <Tags text={plan.status} tone={active ? "success" : "neutral"} />
              </DetailRow>
              <DetailRow icon={DollarSign} label="Price">
                {formatPerPeriod(plan.price, plan.cycle)}
              </DetailRow>
              <DetailRow icon={RefreshCw} label="Billing Cycle">
                {plan.cycle}
              </DetailRow>
              <DetailRow icon={Calendar} label="Start Date">
                {formatDate(plan.startDate)}
              </DetailRow>
              <DetailRow icon={FileText} label="Description">
                {plan.description}
              </DetailRow>
            </dl>
          </section>

          {/* Included benefits */}
          <section className="rounded-xl border border-border bg-primary/[0.04] p-4">
            <h4 className="mb-3 text-sm font-semibold text-heading">Included Benefits</h4>
            <ul className="space-y-3.5">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-heading">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewMembershipPlanModal;