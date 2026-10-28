"use client";

import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import SearchAndFilter from "@/components/Searchandfilter";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { ReqLabel } from "@/components/Modalshell";

import {
  STATE_OPTIONS,
  formatDate,
  getLicenseStatus,
  stateLabel,
} from "./Licensesjurisdictions";

/* ---------- Types ---------- */
export type LicenseStatus = "Active" | "Expiring Soon" | "Expired";

export type PractitionerLicense = {
  id: string;
  state: string; // state code, e.g. "CA"
  number: string;
  issueDate: string; // yyyy-mm-dd
  expiryDate: string; // yyyy-mm-dd
  status: LicenseStatus;
};

const STATUS_TONES: Record<LicenseStatus, TagTone> = {
  Active: "success",
  "Expiring Soon": "warning",
  Expired: "danger",
};

const STATE_FILTER_LABEL = "All States";
const STATUS_FILTER_LABEL = "All Statuses";
const FILTERS = [
  { label: STATE_FILTER_LABEL, options: STATE_OPTIONS.map((o) => o.label) },
  { label: STATUS_FILTER_LABEL, options: ["Active", "Expiring Soon", "Expired"] },
];

const PAGE_SIZE = 8;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

type Draft = Omit<PractitionerLicense, "id" | "status"> & { id?: string };
const emptyDraft = (): Draft => ({ state: "", number: "", issueDate: "", expiryDate: "" });

/* ---------- Component ---------- */
type Props = {
  licenses: PractitionerLicense[];
  jurisdictions: string[]; // state codes
  onLicensesChange: (licenses: PractitionerLicense[]) => void;
  onJurisdictionsChange: (codes: string[]) => void;
};

const PractitionerLicenses = ({
  licenses,
  jurisdictions,
  onLicensesChange,
  onJurisdictionsChange,
}: Props) => {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  /* ---------- Add / edit form ---------- */
  const patchDraft = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setDraftErrors({});
  };

  const saveDraft = () => {
    if (!draft) return;
    const e: Record<string, string> = {};
    if (!draft.state) e.state = "Select a state.";
    if (!draft.number.trim()) e.number = "License number is required.";
    if (!draft.issueDate) e.issueDate = "Issue date is required.";
    if (!draft.expiryDate) e.expiryDate = "Expiry date is required.";
    else if (draft.issueDate && draft.expiryDate <= draft.issueDate)
      e.expiryDate = "Expiry date must be after the issue date.";
    setDraftErrors(e);
    if (Object.keys(e).length) return;

    const item: PractitionerLicense = {
      id: draft.id ?? `lic${Date.now().toString(36)}`,
      state: draft.state,
      number: draft.number.trim(),
      issueDate: draft.issueDate,
      expiryDate: draft.expiryDate,
      status: getLicenseStatus(draft.expiryDate),
    };
    onLicensesChange(
      draft.id ? licenses.map((l) => (l.id === draft.id ? item : l)) : [...licenses, item],
    );
    setDraft(null);
  };

  /* ---------- Filtering + paging ---------- */
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return licenses.filter((l) => {
      if (q && !`${stateLabel(l.state)} ${l.number}`.toLowerCase().includes(q)) return false;
      const stateFilter = activeFilters[STATE_FILTER_LABEL];
      if (stateFilter && stateLabel(l.state) !== stateFilter) return false;
      const statusFilter = activeFilters[STATUS_FILTER_LABEL];
      if (statusFilter && l.status !== statusFilter) return false;
      return true;
    });
  }, [licenses, searchQuery, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredItems, currentPage],
  );

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPage = paginatedItems.filter((l) => selected.has(l.id)).length;
  const allSelected = paginatedItems.length > 0 && selectedOnPage === paginatedItems.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(paginatedItems.map((l) => l.id)));

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <RadioCheckButtonh
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={toggleAll}
          aria-label="Select all"
          className={checkboxCls}
        />
      ),
    },
    { key: "state", label: "State" },
    { key: "number", label: "License Number" },
    { key: "issue", label: "Issue Date" },
    { key: "expiry", label: "Expiry Date" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = paginatedItems.map((l) => ({
    select: (
      <RadioCheckButtonh
        type="checkbox"
        checked={selected.has(l.id)}
        onChange={() => toggleOne(l.id)}
        aria-label={`Select ${stateLabel(l.state)} license`}
        className={checkboxCls}
      />
    ),
    state: <Content title={stateLabel(l.state)} />,
    number: <Content title={l.number} />,
    issue: <Content title={formatDate(l.issueDate)} />,
    expiry: <Content title={formatDate(l.expiryDate)} />,
    status: <Tags text={l.status} tone={STATUS_TONES[l.status]} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["edit", "delete"]}
          onAction={(action) => {
            if (action === "edit") {
              setDraft({ id: l.id, state: l.state, number: l.number, issueDate: l.issueDate, expiryDate: l.expiryDate });
              setDraftErrors({});
            } else if (action === "delete") {
              onLicensesChange(licenses.filter((x) => x.id !== l.id));
              setSelected((prev) => {
                const next = new Set(prev);
                next.delete(l.id);
                return next;
              });
            }
          }}
        />
      </div>
    ),
  }));

  /* ---------- Telemedicine jurisdictions ---------- */
  const availableStates = useMemo(
    () => STATE_OPTIONS.filter((o) => !jurisdictions.includes(o.value)),
    [jurisdictions],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search + filters + add */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchAndFilter
            placeholder="Search licenses..."
            filters={FILTERS}
            showDateRange={false}
            onSearch={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
            onFilterChange={(filterLabel, option) => {
              setActiveFilters((prev) => ({ ...prev, [filterLabel]: option }));
              setPage(1);
            }}
          />
        </div>
        <AddButton
          text="Add License"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setDraft(emptyDraft());
            setDraftErrors({});
          }}
          className="whitespace-nowrap"
        />
      </div>

      {/* Inline add / edit form */}
      {draft && (
        <div className="rounded-[14px] border border-primary/40 bg-primary/[0.03] p-3 sm:p-4">
          <p className="mb-3 text-sm font-semibold text-heading">
            {draft.id ? "Edit License" : "New License"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SignupDropdown
              name="viewLicenseState"
              label={<ReqLabel>State</ReqLabel>}
              placeholder="Select state"
              options={STATE_OPTIONS}
              value={draft.state}
              onChange={(val) => patchDraft({ state: val })}
              error={draftErrors.state}
            />
            <SignupField
              name="viewLicenseNumber"
              label={<ReqLabel>License Number</ReqLabel>}
              placeholder="Enter license number"
              value={draft.number}
              onChange={(e) => patchDraft({ number: e.target.value })}
              error={draftErrors.number}
            />
            <DatePicker
              name="viewLicenseIssue"
              label={<ReqLabel>Issue Date</ReqLabel>}
              value={draft.issueDate}
              onChange={(val) => patchDraft({ issueDate: val })}
              error={draftErrors.issueDate}
            />
            <DatePicker
              name="viewLicenseExpiry"
              label={<ReqLabel>Expiry Date</ReqLabel>}
              value={draft.expiryDate}
              minDate={draft.issueDate || undefined}
              onChange={(val) => patchDraft({ expiryDate: val })}
              error={draftErrors.expiryDate}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <ImportButton text="Cancel" icon={null} onClick={() => setDraft(null)} />
            <AddButton text={draft.id ? "Update License" : "Save License"} onClick={saveDraft} />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card">
            <TableStatus variant="empty" message="No licenses found." />
          </div>
        ) : (
          <Table columns={columns} rows={rows} />
        )}
        {filteredItems.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
            itemLabel="licenses"
            onChange={setPage}
          />
        )}
      </div>

      {/* Telemedicine jurisdictions */}
      <section className="rounded-[8px] border border-border/40 bg-card p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-heading sm:text-base">Telemedicine Jurisdictions</h3>

        {jurisdictions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {jurisdictions.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm text-primary"
              >
                {stateLabel(code)}
                <button
                  type="button"
                  aria-label={`Remove ${stateLabel(code)}`}
                  onClick={() => onJurisdictionsChange(jurisdictions.filter((c) => c !== code))}
                  className="cursor-pointer rounded text-primary transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-w-md">
          <SignupDropdown
            key={jurisdictions.length} // resets the dropdown after each pick
            name="viewTelemedicineJurisdiction"
            placeholder="Select states to add"
            options={availableStates}
            value=""
            onChange={(val) => {
              if (val && !jurisdictions.includes(val)) onJurisdictionsChange([...jurisdictions, val]);
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default PractitionerLicenses;