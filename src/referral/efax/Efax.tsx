"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, CheckCircle2, Clock, FileText, Plus, Send, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import DateTime from "@/components/Datetime";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import FaxDetails, { STATUS_TONE, type Fax, type FaxStatus } from "./Faxdetails";

/* ---------- Static data (replace with API data later) ---------- */
const FAXES: Fax[] = [
  {
    id: "FAX-1001", patient: "Olivia Martin", dob: "04/12/1990", mrn: "KM001245",
    recipient: "Northside Imaging Center", faxNumber: "(408) 555-0123", specialty: "Radiology", location: "210 Bay Street, San Jose, CA 95112",
    document: "MRI Referral.pdf", size: "320 KB", sentDate: "Oct 22, 2026", sentTime: "10:14 AM", status: "Delivered",
    history: [
      { label: "Delivered", time: "Oct 22, 2026 10:14 AM" },
      { label: "Dialing", time: "Oct 22, 2026 10:13 AM" },
      { label: "In Queue", time: "Oct 22, 2026 10:12 AM" },
      { label: "Created", time: "Oct 22, 2026 10:12 AM" },
    ],
  },
  {
    id: "FAX-1002", patient: "James Wilson", dob: "08/23/1978", mrn: "KM003567",
    recipient: "City Medical Group", faxNumber: "(512) 555-0189", specialty: "Internal Medicine", location: "88 Congress Ave, Austin, TX 78701",
    document: "Referral_Notes.pdf", size: "215 KB", sentDate: "Oct 22, 2026", sentTime: "09:42 AM", status: "Pending",
    history: [
      { label: "In Queue", time: "Oct 22, 2026 09:42 AM" },
      { label: "Created", time: "Oct 22, 2026 09:41 AM" },
    ],
  },
  {
    id: "FAX-1003", patient: "Sophia Patel", dob: "11/06/1985", mrn: "KM004321",
    recipient: "Westview Radiology", faxNumber: "(314) 555-0176", specialty: "Radiology", location: "1234 Medical Dr, St. Louis, MO 63110",
    document: "CT_Order.pdf", size: "428 KB", sentDate: "Oct 21, 2026", sentTime: "04:28 PM", status: "Failed",
    history: [
      { label: "Failed", time: "Oct 21, 2026 04:28 PM", note: "No answer from recipient fax number. Please verify the number and try again." },
      { label: "Dialing", time: "Oct 21, 2026 04:28 PM" },
      { label: "In Queue", time: "Oct 21, 2026 04:27 PM" },
      { label: "Created", time: "Oct 21, 2026 04:27 PM" },
    ],
  },
  {
    id: "FAX-1004", patient: "Ethan Brooks", dob: "02/14/1972", mrn: "KM002908",
    recipient: "Lakeside Diagnostics", faxNumber: "(206) 555-0147", specialty: "Diagnostics", location: "45 Lake Ave, Seattle, WA 98101",
    document: "Clinical_Summary.pdf", size: "185 KB", sentDate: "Oct 21, 2026", sentTime: "11:05 AM", status: "Delivered",
    history: [
      { label: "Delivered", time: "Oct 21, 2026 11:05 AM" },
      { label: "Dialing", time: "Oct 21, 2026 11:04 AM" },
      { label: "In Queue", time: "Oct 21, 2026 11:03 AM" },
      { label: "Created", time: "Oct 21, 2026 11:03 AM" },
    ],
  },
  {
    id: "FAX-1005", patient: "Ava Thompson", dob: "07/30/1993", mrn: "KM006214",
    recipient: "Metro Imaging", faxNumber: "(713) 555-0199", specialty: "Radiology", location: "900 Main St, Houston, TX 77002",
    document: "XRay_Request.pdf", size: "260 KB", sentDate: "Oct 20, 2026", sentTime: "03:17 PM", status: "Delivered",
    history: [
      { label: "Delivered", time: "Oct 20, 2026 03:17 PM" },
      { label: "Dialing", time: "Oct 20, 2026 03:16 PM" },
      { label: "In Queue", time: "Oct 20, 2026 03:15 PM" },
      { label: "Created", time: "Oct 20, 2026 03:15 PM" },
    ],
  },
];

const STATS: StatItem[] = [
  { label: "Total Sent", value: "128", Icon: Send, accent: "primary" },
  { label: "Delivered", value: "112", Icon: CheckCircle2, accent: "success" },
  { label: "Pending", value: "9", Icon: Clock, accent: "warning" },
  { label: "Failed", value: "7", Icon: XCircle, accent: "danger" },
] as StatItem[];

const TABS = ["Inbox", "Sent", "Drafts", "Failed"] as const;
type Tab = (typeof TABS)[number];

const STATUSES: FaxStatus[] = ["Delivered", "Pending", "Failed"];
const STATUS_FILTER = "All Status";
const DATE_FILTER = "Oct 15, 2026 – Oct 22, 2026";
const DATE_OPTIONS = ["Last 7 days", "Last 30 days", "This month", "Custom range"];

const PAGE_SIZE = 5;

const SortHeader = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1">
    {children} <ArrowUpDown className="h-3.5 w-3.5" />
  </span>
);

const COLUMNS: TableColumn[] = [
  { key: "patient", label: "Patient", header: <SortHeader>Patient</SortHeader> },
  { key: "recipient", label: "Recipient / eFax Provider" },
  { key: "document", label: "Document" },
  { key: "sent", label: "Sent Date", header: <SortHeader>Sent Date</SortHeader> },
  { key: "status", label: "Status", header: <SortHeader>Status</SortHeader> },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------------------------------------------------------------- */
/*  Page                                                            */
/* ---------------------------------------------------------------- */
const Efax = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Inbox");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [selected, setSelected] = useState<Fax | null>(null);
  const [isPanelClosing, setIsPanelClosing] = useState(false);

  const selectFax = (fax: Fax) => {
    setIsPanelClosing(false);
    setSelected(fax);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAXES.filter((f) => {
      if (tab === "Drafts") return false; // no drafts in the static data
      if (tab === "Failed" && f.status !== "Failed") return false;
      if (status && f.status !== status) return false;
      if (q && !`${f.patient} ${f.recipient} ${f.id} ${f.mrn} ${f.faxNumber}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const rows = filtered.map((f) => ({
    patient: (
      <button type="button" onClick={() => selectFax(f)} className="block w-full min-w-0 cursor-pointer text-left">
        <Name name={f.patient} sub={`DOB: ${f.dob} • MRN: ${f.mrn}`} truncate />
      </button>
    ),
    recipient: <Content title={f.recipient} description={`Fax: ${f.faxNumber}`} truncate />,
    document: (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-danger/5 text-danger">
          <FileText className="h-4 w-4" />
        </span>
        <Content title={f.document} description={f.size} truncate className="min-w-0 flex-1" />
      </div>
    ),
    sent: <DateTime date={f.sentDate} time={f.sentTime} truncate />,
    status: <Tags text={f.status} tone={STATUS_TONE[f.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center gap-1">
        <Actions
          actions={["view", "download", "more"]}
          size="sm"
          onAction={(action) => {
            if (action === "view") selectFax(f);
          }}
        />
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
            <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">eFax Center</h2>
            <p className="mt-0.5 text-sm text-body">Send and track referral and imaging documents securely.</p>
          </div>
          <AddButton text="New Fax" icon={<Plus className="h-4 w-4" />} onClick={() => router.push("/referral/efax/new-efax")} />
        </div>

        <StatCards stats={STATS} />

        {/* Tabs */}
        <div role="tablist" className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-divider">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                tab === t ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <SearchAndFilter
          placeholder="Search patient, recipient, or fax ID"
          value={search}
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[
            { label: STATUS_FILTER, options: STATUSES },
            { label: DATE_FILTER, options: DATE_OPTIONS },
          ]}
          selectedFilters={{ [STATUS_FILTER]: status, [DATE_FILTER]: dateRange }}
          onFilterChange={(label: string, option: string) => {
            if (label === STATUS_FILTER) setStatus(option);
            else if (label === DATE_FILTER) setDateRange(option);
            setPage(1);
          }}
        />

        {/* Table */}
        <div className="space-y-3">
          <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
            {rows.length > 0 ? (
              <Table columns={COLUMNS} rows={rows} bordered={false} />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-body">No faxes match your filters.</p>
            )}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="results"
            onChange={setPage}
          />
        </div>
      </div>

      {/* Details drawer (opens from the patient name / view icon) */}
      <FaxDetails
        fax={selected}
        onCloseStart={() => setIsPanelClosing(true)}
        onClose={() => {
          setIsPanelClosing(false);
          setSelected(null);
        }}
      />
    </div>
  );
};

export default Efax;
