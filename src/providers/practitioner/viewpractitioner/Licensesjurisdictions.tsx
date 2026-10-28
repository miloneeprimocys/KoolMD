"use client";

import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import SignupField, { FieldError } from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import { ReqLabel } from "@/components/Modalshell";

type Errors = Record<string, string>;

/* ---------- Constants ---------- */
const STATES: { code: string; name: string }[] = (
  "AL:Alabama,AK:Alaska,AZ:Arizona,AR:Arkansas,CA:California,CO:Colorado,CT:Connecticut,DE:Delaware," +
  "FL:Florida,GA:Georgia,HI:Hawaii,ID:Idaho,IL:Illinois,IN:Indiana,IA:Iowa,KS:Kansas,KY:Kentucky," +
  "LA:Louisiana,ME:Maine,MD:Maryland,MA:Massachusetts,MI:Michigan,MN:Minnesota,MS:Mississippi," +
  "MO:Missouri,MT:Montana,NE:Nebraska,NV:Nevada,NH:New Hampshire,NJ:New Jersey,NM:New Mexico," +
  "NY:New York,NC:North Carolina,ND:North Dakota,OH:Ohio,OK:Oklahoma,OR:Oregon,PA:Pennsylvania," +
  "RI:Rhode Island,SC:South Carolina,SD:South Dakota,TN:Tennessee,TX:Texas,UT:Utah,VT:Vermont," +
  "VA:Virginia,WA:Washington,WV:West Virginia,WI:Wisconsin,WY:Wyoming"
)
  .split(",")
  .map((s) => {
    const [code, name] = s.split(":");
    return { code, name };
  });

export const stateLabel = (code: string) => {
  const s = STATES.find((x) => x.code === code);
  return s ? `${s.name} (${s.code})` : code;
};

export const STATE_OPTIONS = STATES.map((s) => ({ value: s.code, label: `${s.name} (${s.code})` }));

/** yyyy-mm-dd → MM/DD/YYYY */
export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const EXPIRING_SOON_DAYS = 90;

type LicenseStatus = "Active" | "Expiring Soon" | "Expired";

export const getLicenseStatus = (expiryDate: string): LicenseStatus => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Expired";
  if (days <= EXPIRING_SOON_DAYS) return "Expiring Soon";
  return "Active";
};

const STATUS_TONES: Record<LicenseStatus, TagTone> = {
  Active: "success",
  "Expiring Soon": "warning",
  Expired: "danger",
};

/* ---------- Values ---------- */
export type LicenseItem = {
  id: string;
  state: string;
  number: string;
  issueDate: string;
  expiryDate: string;
};

export interface LicenseValues {
  licenses: LicenseItem[];
  jurisdictions: string[]; // state codes
}

export const initialLicenses = (): LicenseValues => ({ licenses: [], jurisdictions: [] });

/* ---------- Validation ---------- */
export const validateLicenses = (v: LicenseValues): Errors => {
  const e: Errors = {};
  if (v.licenses.length === 0) e.licenses = "Add at least one state license.";
  return e;
};

/* ---------- Component ---------- */
type Props = {
  values: LicenseValues;
  errors: Errors;
  onChange: (patch: Partial<LicenseValues>) => void;
};

type Draft = Omit<LicenseItem, "id"> & { id?: string };
const emptyDraft = (): Draft => ({ state: "", number: "", issueDate: "", expiryDate: "" });

const LicensesJurisdictions = ({ values: v, errors, onChange }: Props) => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftErrors, setDraftErrors] = useState<Errors>({});

  /* ---------- License form ---------- */
  const patchDraft = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setDraftErrors({});
  };

  const saveDraft = () => {
    if (!draft) return;
    const e: Errors = {};
    if (!draft.state) e.state = "Select a state.";
    if (!draft.number.trim()) e.number = "License number is required.";
    if (!draft.issueDate) e.issueDate = "Issue date is required.";
    if (!draft.expiryDate) e.expiryDate = "Expiry date is required.";
    else if (draft.issueDate && draft.expiryDate <= draft.issueDate)
      e.expiryDate = "Expiry date must be after the issue date.";
    setDraftErrors(e);
    if (Object.keys(e).length) return;

    const item: LicenseItem = {
      id: draft.id ?? `lic${Date.now().toString(36)}`,
      state: draft.state,
      number: draft.number.trim(),
      issueDate: draft.issueDate,
      expiryDate: draft.expiryDate,
    };
    onChange({
      licenses: draft.id
        ? v.licenses.map((l) => (l.id === draft.id ? item : l))
        : [...v.licenses, item],
    });
    setDraft(null);
  };

  const removeLicense = (id: string) => onChange({ licenses: v.licenses.filter((l) => l.id !== id) });

  /* ---------- Table ---------- */
  const columns: TableColumn[] = [
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

  const rows = v.licenses.map((l) => {
    const status = getLicenseStatus(l.expiryDate);
    return {
      state: <span className="text-sm text-heading">{stateLabel(l.state)}</span>,
      number: <span className="text-sm text-heading">{l.number}</span>,
      issue: <span className="text-sm text-heading">{formatDate(l.issueDate)}</span>,
      expiry: <span className="text-sm text-heading">{formatDate(l.expiryDate)}</span>,
      status: <Tags text={status} tone={STATUS_TONES[status]} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["edit", "delete"]}
            size="sm"
            onAction={(action) => {
              if (action === "edit") {
                setDraft({ ...l });
                setDraftErrors({});
              } else if (action === "delete") removeLicense(l.id);
            }}
          />
        </div>
      ),
    };
  });

  /* ---------- Telemedicine jurisdictions ---------- */
  const availableStates = useMemo(
    () => STATE_OPTIONS.filter((o) => !v.jurisdictions.includes(o.value)),
    [v.jurisdictions],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* State licenses */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-heading">State Licenses</h3>
          {!draft && (
            <AddButton
              text="Add License"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setDraft(emptyDraft());
                setDraftErrors({});
              }}
              className="whitespace-nowrap"
            />
          )}
        </div>

        {/* Inline add / edit form */}
        {draft && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/[0.03] p-3 sm:p-4">
            <p className="mb-3 text-sm font-semibold text-heading">
              {draft.id ? "Edit License" : "New License"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SignupDropdown
                name="licenseState"
                label={<ReqLabel>State</ReqLabel>}
                placeholder="Select state"
                options={STATE_OPTIONS}
                value={draft.state}
                onChange={(val) => patchDraft({ state: val })}
                error={draftErrors.state}
              />
              <SignupField
                name="licenseNumber"
                label={<ReqLabel>License Number</ReqLabel>}
                placeholder="Enter license number"
                value={draft.number}
                onChange={(e) => patchDraft({ number: e.target.value })}
                error={draftErrors.number}
              />
              <SignupField
                name="licenseIssueDate"
                type="date"
                label={<ReqLabel>Issue Date</ReqLabel>}
                value={draft.issueDate}
                onChange={(e) => patchDraft({ issueDate: e.target.value })}
                error={draftErrors.issueDate}
              />
              <SignupField
                name="licenseExpiryDate"
                type="date"
                label={<ReqLabel>Expiry Date</ReqLabel>}
                value={draft.expiryDate}
                onChange={(e) => patchDraft({ expiryDate: e.target.value })}
                error={draftErrors.expiryDate}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <ImportButton text="Cancel" icon={null} onClick={() => setDraft(null)} />
              <AddButton text={draft.id ? "Update License" : "Save License"} onClick={saveDraft} />
            </div>
          </div>
        )}

        <div id="licenses" className="overflow-hidden rounded-[14px] border border-border bg-card">
          {v.licenses.length === 0 ? (
            <TableStatus variant="empty" message="No licenses added yet." />
          ) : (
            <Table columns={columns} rows={rows} bordered={false} />
          )}
        </div>
        <FieldError message={errors.licenses} />
      </section>

      {/* Telemedicine jurisdictions */}
      <section className="rounded-[14px] border border-border bg-card p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold text-heading">Telemedicine Jurisdictions</h3>

        {v.jurisdictions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {v.jurisdictions.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm text-primary"
              >
                {stateLabel(code)}
                <button
                  type="button"
                  aria-label={`Remove ${stateLabel(code)}`}
                  onClick={() => onChange({ jurisdictions: v.jurisdictions.filter((c) => c !== code) })}
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
            key={v.jurisdictions.length} // resets the dropdown after each pick
            name="telemedicineJurisdiction"
            placeholder="Select states to add"
            options={availableStates}
            value=""
            onChange={(val) => {
              if (val && !v.jurisdictions.includes(val)) onChange({ jurisdictions: [...v.jurisdictions, val] });
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default LicensesJurisdictions;