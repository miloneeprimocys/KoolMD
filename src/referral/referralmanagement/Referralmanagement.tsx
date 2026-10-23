"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Flag,
  Plus,
  Stethoscope,
  StickyNote,
  Users,
} from "lucide-react";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import CommonRightSection from "@/components/CommonRightSection";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { cardCls } from "@/providers/Shared";

/* ---------- Types + static data (replace with API data later) ---------- */
type ReferralStatus = "Sent" | "Pending" | "Accepted" | "Needs Follow-up" | "Completed";

type Referral = {
  id: string;
  patient: string;
  age: number;
  gender: "M" | "F";
  mrn: string;
  specialty: string;
  provider: string;
  providerSub?: string;
  created: string;
  status: ReferralStatus;
  priority: "Routine" | "Urgent";
  reason: string;
  notes: string;
};

const REFERRALS: Referral[] = [
  { id: "REF-2026-0148", patient: "Olivia Martin", age: 34, gender: "F", mrn: "MRN-004852", specialty: "Cardiology", provider: "Dr. Ethan Brooks", providerSub: "Northside Cardiology", created: "Oct 20, 2026", status: "Sent", priority: "Routine", reason: "Evaluation of intermittent chest discomfort and palpitations.", notes: "Please share ECG and echo results with the referring provider." },
  { id: "REF-2026-0147", patient: "Noah Williams", age: 28, gender: "M", mrn: "MRN-006371", specialty: "Orthopedics", provider: "City Orthopedic Center", created: "Oct 20, 2026", status: "Pending", priority: "Routine", reason: "Persistent right knee pain after sports injury.", notes: "MRI report attached to the patient chart." },
  { id: "REF-2026-0146", patient: "Ava Thompson", age: 42, gender: "F", mrn: "MRN-008152", specialty: "Dermatology", provider: "Dr. Mia Patel", providerSub: "SkinCare Clinic", created: "Oct 19, 2026", status: "Accepted", priority: "Routine", reason: "Skin lesion assessment and biopsy consultation.", notes: "Appointment to be scheduled by the clinic." },
  { id: "REF-2026-0145", patient: "Liam Anderson", age: 50, gender: "M", mrn: "MRN-005619", specialty: "Neurology", provider: "Central Neuro Clinic", created: "Oct 18, 2026", status: "Needs Follow-up", priority: "Urgent", reason: "Recurrent migraines with visual aura.", notes: "No response from the clinic yet. Follow up by phone." },
  { id: "REF-2026-0144", patient: "Sophia Garcia", age: 37, gender: "F", mrn: "MRN-007284", specialty: "Radiology", provider: "West Imaging Center", created: "Oct 17, 2026", status: "Completed", priority: "Routine", reason: "Abdominal ultrasound for upper abdominal pain.", notes: "Report received and filed in the patient chart." },
];

const STATUSES: ReferralStatus[] = ["Sent", "Pending", "Accepted", "Needs Follow-up", "Completed"];
const SPECIALTIES = ["Cardiology", "Orthopedics", "Dermatology", "Neurology", "Radiology"];
const STATUS_FILTER = "All Statuses";
const SPECIALTY_FILTER = "All Specialties";

const STATUS_TONE: Record<ReferralStatus, TagTone> = {
  Sent: "info",
  Pending: "warning",
  Accepted: "success",
  "Needs Follow-up": "danger",
  Completed: "violet",
};

const STATS: StatItem[] = [
  { label: "Total Referrals", value: "248", change: "12%", positive: true, Icon: Users, accent: "primary" },
  { label: "Pending", value: "32", change: "8%", positive: true, Icon: Clock, accent: "warning" },
  { label: "Accepted", value: "176", change: "15%", positive: true, Icon: CheckCircle2, accent: "success" },
  { label: "Needs Follow-up", value: "12", change: "20%", positive: false, Icon: AlertCircle, accent: "danger" },
];

const ACTIVITY: { dot: string; title: string; time: string; text: string }[] = [
  { dot: "bg-success", title: "Referral accepted", time: "2 hours ago", text: "Ava Thompson's referral to Dr. Mia Patel has been accepted." },
  { dot: "bg-primary", title: "Status updated", time: "4 hours ago", text: "Noah Williams' referral status changed to Pending." },
  { dot: "bg-violet", title: "Referral sent", time: "6 hours ago", text: "Olivia Martin's referral to Dr. Ethan Brooks has been sent." },
  { dot: "bg-danger", title: "Needs follow-up", time: "1 day ago", text: "Liam Anderson's referral requires follow-up." },
  { dot: "bg-violet/60", title: "Referral completed", time: "1 day ago", text: "Sophia Garcia's referral to West Imaging Center completed." },
];

const PAGE_SIZE = 5;
const TOTAL_REFERRALS = 248;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10", header: null },
  { key: "patient", label: "Patient" },
  { key: "id", label: "Referral ID" },
  { key: "specialty", label: "Specialty" },
  { key: "provider", label: "Referred Provider / Facility" },
  {
    key: "created",
    label: "Created Date",
    header: (
      <span className="inline-flex items-center gap-1">
        Created Date <ArrowDown className="h-3.5 w-3.5" />
      </span>
    ),
  },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Referral details drawer (built on CommonRightSection)           */
/* ---------------------------------------------------------------- */
const DetailItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-body" />
    <div className="min-w-0">
      <dt className="text-xs text-body">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-heading">{children}</dd>
    </div>
  </div>
);

const ReferralPanel = ({
  referral,
  onClose,
  onCloseStart,
}: {
  referral: Referral | null;
  onClose: () => void;
  onCloseStart: () => void;
}) => {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closePanel = () => {
    if (!referral || closeTimer.current) return;
    setIsClosing(true);
    onCloseStart();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, duration);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  /* Slide in whenever a (different) referral is selected */
  useLayoutEffect(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsClosing(false);
    setIsOpen(false);
    if (!referral) return;
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [referral?.id]);

  useEffect(() => {
    if (!referral) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!referral) return null;

  return (
    <CommonRightSection
      label={`Referral ${referral.id}`}
      ariaModal
      open={isOpen}
      closing={isClosing}
      onClose={closePanel}
      panelClassName="2xl:max-w-[420px]"
      header={
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-heading">{referral.id}</h2>
            <p className="mt-0.5 text-xs text-body">Created {referral.created}</p>
          </div>
        </div>
      }
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        {/* Patient */}
        <div className="flex items-center gap-3 border-b border-divider pb-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials(referral.patient)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-heading">{referral.patient}</h3>
            <p className="text-xs text-body">
              {referral.age}
              {referral.gender} • {referral.mrn}
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <Tags text={referral.status} tone={STATUS_TONE[referral.status]} />
          </div>
        </div>

        {/* Details */}
        <dl className="space-y-4">
          <DetailItem icon={Stethoscope} label="Specialty">
            {referral.specialty}
          </DetailItem>
          <DetailItem icon={Building2} label="Referred Provider / Facility">
            {referral.provider}
            {referral.providerSub && (
              <span className="block text-xs font-normal text-body">{referral.providerSub}</span>
            )}
          </DetailItem>
          <DetailItem icon={CalendarDays} label="Created Date">
            {referral.created}
          </DetailItem>
          <DetailItem icon={Flag} label="Priority">
            <Tags text={referral.priority} tone={referral.priority === "Urgent" ? "danger" : "info"} />
          </DetailItem>
          <DetailItem icon={FileText} label="Reason for Referral">
            {referral.reason}
          </DetailItem>
          <DetailItem icon={StickyNote} label="Notes">
            {referral.notes || "—"}
          </DetailItem>
        </dl>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 border-t border-divider pt-4">
          <ImportButton
            text="Follow Up"
            icon={null}
            className="!h-9 !min-w-0 !w-full !gap-1.5 !rounded-lg !px-2 !text-xs !border-primary/30 !text-primary hover:!border-primary/40 hover:!bg-primary/5 hover:!text-primary"
            onClick={() => {}}
          />
          <ImportButton
            text="Complete"
            icon={null}
            className="!h-9 !min-w-0 !w-full !gap-1.5 !rounded-lg !px-2 !text-xs !border-border !text-heading hover:!border-primary/30 hover:!bg-primary/5 hover:!text-primary"
            onClick={() => {}}
          />
          <DeleteButton
            text="Cancel"
            icon={null}
            className="!h-9 !min-w-0 !w-full !rounded-lg !border !border-danger/30 !bg-transparent !px-2 !text-xs !font-medium !text-danger hover:!border-danger/40 hover:!bg-danger/5 focus-visible:!ring-danger/30"
            onClick={() => {}}
          />
        </div>
      </div>
    </CommonRightSection>
  );
};

/* ---------------------------------------------------------------- */
/*  Page                                                            */
/* ---------------------------------------------------------------- */
const ReferralManagement = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selected, setSelected] = useState<Referral | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selectReferral = (referral: Referral) => {
    setIsPanelClosing(false);
    setSelected(referral);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REFERRALS.filter((r) => {
      if (status && r.status !== status) return false;
      if (specialty && r.specialty !== specialty) return false;
      if (q && !`${r.patient} ${r.id} ${r.mrn} ${r.provider}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, status, specialty]);

  const isFiltered = !!(search.trim() || status || specialty);
  const totalItems = isFiltered ? filtered.length : TOTAL_REFERRALS;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const rowKeys = filtered.map((r) => r.id);
  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(rowKeys);

  const columns = COLUMNS.map((c) =>
    c.key === "select"
      ? {
          ...c,
          header: (
            <TableSelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              className={checkboxCls}
            />
          ),
        }
      : c,
  );

  const rows = filtered.map((r) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selectedKeys.has(r.id)}
        onChange={() => toggleRow(r.id)}
        aria-label={`Select ${r.patient}`}
        className={checkboxCls}
      />
    ),
    patient: (
      <button type="button" onClick={() => selectReferral(r)} className="w-full min-w-0 cursor-pointer text-left">
        <Name name={r.patient} sub={`${r.age}${r.gender} • ${r.mrn}`} truncate />
      </button>
    ),
    id: (
      <button
        type="button"
        onClick={() => selectReferral(r)}
        className="cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {r.id}
      </button>
    ),
    specialty: <Content title={r.specialty} truncate />,
    provider: <Name name={r.provider} sub={r.providerSub} truncate />,
    created: <Content title={r.created} />,
    status: <Tags text={r.status} tone={STATUS_TONE[r.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions actions={["view"]} onAction={() => selectReferral(r)} />
      </div>
    ),
  }));

  return (
    <div className="relative w-full">
      <div
        className={`mx-auto min-w-0 w-full max-w-[1600px] space-y-4 transition-all duration-300 ease-out sm:space-y-5 ${
          selected && !isPanelClosing ? "2xl:pr-[420px]" : ""
        }`}
      >
        {/* Title + action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">
              Referral Management
            </h2>
            <p className="mt-0.5 text-sm text-body">Create, track, and manage patient referrals.</p>
          </div>
          <AddButton
            text="New Referral"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push("/referral/management/new-referral")}
          />
        </div>

        <StatCards stats={STATS} />

        {/* Search + filters + export */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
          <div className="min-w-0 flex-1">
            <SearchAndFilter
              placeholder="Search referrals by patient name, ID or provider..."
              value={search}
              onSearch={(v: string) => {
                setSearch(v);
                setPage(1);
              }}
              filters={[
                { label: STATUS_FILTER, options: STATUSES },
                { label: SPECIALTY_FILTER, options: SPECIALTIES },
              ]}
              selectedFilters={{ [STATUS_FILTER]: status, [SPECIALTY_FILTER]: specialty }}
              onFilterChange={(label: string, option: string) => {
                if (label === STATUS_FILTER) setStatus(option);
                else if (label === SPECIALTY_FILTER) setSpecialty(option);
                setPage(1);
              }}
            />
          </div>
          <ImportButton text="Export" icon={<Download className="h-4 w-4" />} onClick={() => {}} />
        </div>

        {/* Table + activity */}
        <div
          className={`grid items-start gap-4 sm:gap-5 ${
            selected && !isPanelClosing ? "grid-cols-1" : "2xl:grid-cols-[minmax(0,1fr)_300px]"
          }`}
        >
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <div className="space-y-3">
              <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
                {rows.length > 0 ? (
                  <Table columns={columns} rows={rows} bordered={false} />
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-body">No referrals match your filters.</p>
                )}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                itemLabel="referrals"
                onChange={setPage}
              />
            </div>
          </div>

          <aside className={`${cardCls} sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-heading">Referral activity</h3>
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              View all activity
            </button>
          </div>
          <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px before:bg-divider">
            {ACTIVITY.map((a) => (
              <li key={a.title} className="relative pl-6">
                <span className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ${a.dot}`} />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-heading">{a.title}</p>
                  <span className="shrink-0 text-[11px] text-body">{a.time}</span>
                </div>
                <p className="mt-1 text-xs text-body">{a.text}</p>
              </li>
            ))}
          </ol>
          </aside>
        </div>
      </div>

      {/* Details drawer (opens from the view icon / patient / referral ID) */}
      <ReferralPanel
        referral={selected}
        onCloseStart={() => setIsPanelClosing(true)}
        onClose={() => {
          setIsPanelClosing(false);
          setSelected(null);
        }}
      />
    </div>
  );
};

export default ReferralManagement;
