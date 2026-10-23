"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Filter, Mail, MapPin, Phone } from "lucide-react";

import SearchAndFilter from "@/components/Searchandfilter";
import ImportButton from "@/components/ImportButton";
import Actions from "@/components/Actions";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import DatePicker from "@/components/Datepicker";
import { ModalRadioGroup } from "@/components/Modalshell";
import { Opt, Req, TextArea, cardCls, todayISO, type Errors, type StepProps } from "@/providers/Shared";
import { PRIORITY_OPTIONS, TYPE_OPTIONS, initials, type ReferralValues } from "./Referraldetails";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export type Provider = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  address: string;
  phone: string;
  email: string;
  availability: string;
  nextAvailable: boolean;
  insurance: string[];
};

export const PROVIDERS: Provider[] = [
  { id: "ethan", name: "Dr. Ethan Brooks, MD", specialty: "Cardiology", clinic: "Northside Cardiology", address: "123 Health St, Phoenix, AZ", phone: "+1 415-555-0123", email: "ethan.brooks@northsidecardio.com", availability: "Oct 21, 2026", nextAvailable: true, insurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare", "Medicare", "Humana", "Kaiser"] },
  { id: "mia", name: "Dr. Mia Patel, MD", specialty: "Dermatology", clinic: "SkinCare Clinic", address: "456 Wellness Ave, Phoenix, AZ", phone: "+1 415-555-0147", email: "mia.patel@skincare.com", availability: "Oct 23, 2026", nextAvailable: false, insurance: ["Aetna", "Cigna", "Medicare"] },
  { id: "james", name: "Dr. James Wilson, MD", specialty: "Orthopedics", clinic: "City Orthopedic Center", address: "789 Medical Dr, Phoenix, AZ", phone: "+1 415-555-0162", email: "james.wilson@cityortho.com", availability: "Oct 22, 2026", nextAvailable: false, insurance: ["Blue Cross Blue Shield", "UnitedHealthcare"] },
  { id: "emily", name: "Dr. Emily Carter, MD", specialty: "Neurology", clinic: "Central Neuro Clinic", address: "321 Brain St, Phoenix, AZ", phone: "+1 415-555-0178", email: "emily.carter@centralneuro.com", availability: "Oct 20, 2026", nextAvailable: true, insurance: ["Aetna", "Cigna", "UnitedHealthcare", "Medicare"] },
  { id: "robert", name: "Dr. Robert Kim, MD", specialty: "Radiology", clinic: "West Imaging Center", address: "654 Imaging Rd, Phoenix, AZ", phone: "+1 415-555-0189", email: "robert.kim@westimaging.com", availability: "Oct 24, 2026", nextAvailable: false, insurance: ["Aetna", "Blue Cross Blue Shield", "Medicare"] },
];

export const getProvider = (id: string) => PROVIDERS.find((p) => p.id === id);

const SPECIALTY_FILTER = "All Specialties";
const LOCATION_FILTER = "All Locations";
const INSURANCE_FILTER = "Insurance Accepted";
const SPECIALTY_LIST = Array.from(new Set(PROVIDERS.map((p) => p.specialty)));
const LOCATION_LIST = Array.from(new Set(PROVIDERS.map((p) => p.clinic)));
const INSURANCE_LIST = Array.from(new Set(PROVIDERS.flatMap((p) => p.insurance)));

const PAGE_SIZE = 5;
const TOTAL_PROVIDERS = 28;

const TABS = [
  { key: "providers", label: "Providers" },
  { key: "facilities", label: "Facilities / Locations" },
  { key: "recent", label: "Recent Referrals" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10", header: null },
  { key: "provider", label: "Provider" },
  { key: "specialty", label: "Specialty" },
  { key: "clinic", label: "Clinic / Location" },
  { key: "availability", label: "Availability" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

const radioCls =
  "h-4 w-4 cursor-pointer border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

/* ---------------------------------------------------------------- */
/*  Validation                                                       */
/* ---------------------------------------------------------------- */
export const validateProviderReason = (v: ReferralValues): Errors => {
  const e: Errors = {};
  if (!v.provider) e.provider = "Select a receiving provider to continue.";
  if (!v.reason.trim()) e.reason = "Reason for referral is required.";
  return e;
};

/* ---------------------------------------------------------------- */
/*  Small pieces (ProviderAvatar is reused on steps 3 and 4)         */
/* ---------------------------------------------------------------- */
export const ProviderAvatar = ({ name, className = "h-9 w-9 text-xs" }: { name: string; className?: string }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${className}`}
  >
    {initials(name)}
  </span>
);

const DetailLine = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-start gap-2.5 text-sm text-body">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <span className="min-w-0 break-words">{children}</span>
  </div>
);

/** Right-hand "Selected Provider" card */
const SelectedProviderCard = ({ provider, onChange }: { provider?: Provider; onChange: () => void }) => (
  <aside className={`${cardCls} sm:p-6`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-heading">Selected Provider</h3>
      {provider && (
        <button
          type="button"
          onClick={onChange}
          className="cursor-pointer text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Change
        </button>
      )}
    </div>

    {provider ? (
      <>
        <div className="flex items-start gap-4">
          <ProviderAvatar name={provider.name} className="h-20 w-20 text-xl" />
          <div className="min-w-0 space-y-2">
            <div>
              <p className="text-base font-semibold text-heading">{provider.name}</p>
              <p className="text-sm text-body">{provider.specialty}</p>
            </div>
            <DetailLine icon={MapPin}>
              <span className="block font-medium text-heading">{provider.clinic}</span>
              {provider.address} 85004
            </DetailLine>
            <DetailLine icon={Phone}>{provider.phone}</DetailLine>
            <DetailLine icon={Mail}>{provider.email}</DetailLine>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-primary/[0.06] p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-heading">Availability</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-body">
              <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
              Next available: {provider.availability}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-body" />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-heading">Accepted Insurance</p>
          <div className="flex flex-wrap gap-2">
            {provider.insurance.slice(0, 5).map((i) => (
              <Tags key={i} text={i} tone="info" />
            ))}
            {provider.insurance.length > 5 && (
              <Tags text={`+${provider.insurance.length - 5} more`} tone="neutral" />
            )}
          </div>
        </div>
      </>
    ) : (
      <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">
        Select a provider from the list to see their details.
      </p>
    )}
  </aside>
);

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
const ProviderReason = ({ values: v, errors, onChange }: StepProps<ReferralValues>) => {
  const [tab, setTab] = useState<TabKey>("providers");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [insurance, setInsurance] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      if (specialty && p.specialty !== specialty) return false;
      if (location && p.clinic !== location) return false;
      if (insurance && !p.insurance.includes(insurance)) return false;
      if (q && !`${p.name} ${p.specialty} ${p.clinic}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, specialty, location, insurance]);

  const isFiltered = !!(search.trim() || specialty || location || insurance);
  const totalItems = isFiltered ? filtered.length : TOTAL_PROVIDERS;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const selected = getProvider(v.provider);

  const rows = filtered.map((p) => ({
    select: (
      <RadioCheckButtonh
        type="radio"
        name="provider"
        checked={v.provider === p.id}
        onChange={() => onChange({ provider: p.id })}
        aria-label={`Select ${p.name}`}
        className={radioCls}
      />
    ),
    provider: <Name name={p.name} truncate />,
    specialty: <Content title={p.specialty} truncate />,
    clinic: <Name name={p.clinic} sub={p.address} truncate />,
    availability: (
      <div className="flex flex-col items-start gap-1">
        {p.nextAvailable && <Tags text="Next Available" tone="success" />}
        <Content title={p.availability} />
      </div>
    ),
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view"]}
          onAction={(action) => {
            if (action === "view") onChange({ provider: p.id });
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================= LEFT: provider picker ================= */}
        <section className={`${cardCls} min-w-0 sm:p-6`}>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Select Receiving Provider / Facility</h3>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              Search and select the provider or facility to send this referral to.
            </p>
          </div>

          {/* Tabs */}
          <div role="tablist" className="mb-4 flex gap-5 overflow-x-auto border-b border-divider">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "providers" ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start 2xl:items-center">
                <div className="min-w-0 flex-1">
                  <SearchAndFilter
                    placeholder="Search by provider name, specialty or clinic..."
                    value={search}
                    onSearch={(val: string) => {
                      setSearch(val);
                      setPage(1);
                    }}
                    filters={[
                      { label: SPECIALTY_FILTER, options: SPECIALTY_LIST },
                      { label: LOCATION_FILTER, options: LOCATION_LIST },
                      { label: INSURANCE_FILTER, options: INSURANCE_LIST },
                    ]}
                    selectedFilters={{
                      [SPECIALTY_FILTER]: specialty,
                      [LOCATION_FILTER]: location,
                      [INSURANCE_FILTER]: insurance,
                    }}
                    onFilterChange={(label: string, option: string) => {
                      if (label === SPECIALTY_FILTER) setSpecialty(option);
                      else if (label === LOCATION_FILTER) setLocation(option);
                      else if (label === INSURANCE_FILTER) setInsurance(option);
                      setPage(1);
                    }}
                  />
                </div>
                <ImportButton text="More Filters" icon={<Filter className="h-4 w-4" />} onClick={() => {}} />
              </div>

              <div
                className={`w-full min-w-0 overflow-hidden rounded-[14px] border bg-card ${
                  errors.provider ? "border-danger" : "border-border"
                }`}
              >
                {rows.length > 0 ? (
                  <Table columns={COLUMNS} rows={rows} bordered={false} />
                ) : (
                  <p className="px-4 py-10 text-center text-sm text-body">No providers match your filters.</p>
                )}
              </div>
              {errors.provider && <p className="text-xs text-danger">{errors.provider}</p>}

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                itemLabel="providers"
                onChange={setPage}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-body">
              {tab === "facilities" ? "Facilities and locations will appear here." : "Recent referrals will appear here."}
            </p>
          )}
        </section>

        {/* ================= RIGHT: selected provider ================= */}
        <SelectedProviderCard
          provider={selected}
          onChange={() => {
            onChange({ provider: "" });
            setTab("providers");
          }}
        />
      </div>

      {/* ================= Reason for referral ================= */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-heading sm:text-lg">Reason for Referral</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            Provide the clinical reason and any specific consultation request.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            name="reason"
            label={<>Reason for Referral<Req /></>}
            placeholder="e.g. Evaluation of chest pain, abnormal ECG, ongoing symptoms..."
            value={v.reason}
            onChange={(val) => onChange({ reason: val })}
            maxLength={1000}
            rows={3}
            error={errors.reason}
          />
          <TextArea
            name="consultationRequest"
            label={<>Specific Consultation Request<Opt /></>}
            placeholder="e.g. Stress test, ECG, medication review..."
            value={v.consultationRequest}
            onChange={(val) => onChange({ consultationRequest: val })}
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <ModalRadioGroup
            name="priority"
            label={<>Priority<Req /></>}
            value={v.priority}
            onChange={(val) => onChange({ priority: val })}
            options={PRIORITY_OPTIONS}
            className="h-12"
          />
          <DatePicker
            name="appointmentDate"
            label={<>Requested Appointment Date<Opt /></>}
            placeholder="Select date"
            value={v.appointmentDate}
            onChange={(val) => onChange({ appointmentDate: val })}
            minDate={todayISO()}
          />
          <ModalRadioGroup
            name="referralType"
            label={<>Referral Type<Req /></>}
            value={v.referralType}
            onChange={(val) => onChange({ referralType: val })}
            options={TYPE_OPTIONS}
            className="h-12"
          />
        </div>
      </section>
    </div>
  );
};

export default ProviderReason;
