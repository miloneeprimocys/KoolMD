"use client";

import React from "react";
import Link from "next/link";
import { Bell, Clock, ClipboardCheck, FileText, Medal, MapPin, ShieldCheck, User, Building2, Phone } from "lucide-react";

import EditButton from "@/components/EditButton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Tags from "@/components/Tags";
import { FieldError } from "@/components/SignupField";
import { SectionCard, cardCls, type Errors } from "@/providers/Shared";

import { validateRegistration, type RegistrationValues } from "./ProfileRegistration";
import { stateLabel, validateLicenses, type LicensesValues } from "./ProfileLicenses";
import { validateLocationStep, type LocationStepValues } from "./ProfileLocation";
import { addressLabel, LocationThumb, phoneLabel } from "./PracticeLocations";
import { validateDocuments, type DocumentsValues } from "./ProfileDocuments";

/* ---------------------------------------------------------------- */
/*  Small pieces                                                     */
/* ---------------------------------------------------------------- */
const CompleteTag = ({ errors }: { errors: Errors }) =>
  Object.keys(errors).length === 0 ? <Tags text="Complete" tone="success" size="xs" /> : <Tags text="Incomplete" tone="warning" size="xs" />;

/** Section card whose heading also carries the Complete / Incomplete tag and Edit button. */
const ReviewCard = ({
  icon, title, errors, onEdit, children,
}: { icon: React.ReactNode; title: string; errors: Errors; onEdit: () => void; children: React.ReactNode }) => (
  <SectionCard
    icon={icon}
    title={title}
    action={
      <div className="flex shrink-0 items-center gap-2">
        <CompleteTag errors={errors} />
        <EditButton section={title} onEdit={onEdit} className="shrink-0 !h-9 !px-3 !text-xs" />
      </div>
    }
  >
    {children}
  </SectionCard>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-body">{label}</p>
    <div className="mt-0.5 text-sm font-semibold text-heading">{children}</div>
  </div>
);

const stateName = (code: string) => stateLabel(code).replace(/ \(.+\)$/, "");

/* ---------------------------------------------------------------- */
/*  Step 5 – Review & Submit                                         */
/* ---------------------------------------------------------------- */
interface Props {
  registration: RegistrationValues;
  licenses: LicensesValues;
  location: LocationStepValues;
  documents: DocumentsValues;
  confirmed: boolean;
  onConfirm: (next: boolean) => void;
  error?: string;
  onEditStep: (step: number) => void;
}

const REVIEW_STEPS = [
  { Icon: Clock, title: "Estimated Review Time", text: "1–3 business days" },
  { Icon: Bell, title: "You'll Receive a Notification", text: "We'll email you once a decision is made." },
  { Icon: ShieldCheck, title: "Next Steps", text: "After approval, you can configure availability and start seeing patients." },
];

const ProfileReview = ({ registration: r, licenses: l, location: loc, documents: d, confirmed, onConfirm, error, onEditStep }: Props) => {
  const initials = `${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase();
  const fullName = `${r.providerType === "Physician" ? "Dr. " : ""}${r.firstName} ${r.lastName}`.trim();
  const primary = loc.locations.find((x) => x.primary) ?? loc.locations[0];
  const jurisdictions = loc.tele.mode === "all" ? l.licenses.map((x) => x.state) : loc.tele.states;
  const boards = l.credentials.map((c) => c.split(" – ")[1] ?? c).join(", ");
  const shownDocs = d.files.slice(0, 3);

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ================= LEFT ================= */}
      <div className="min-w-0 space-y-4 sm:space-y-5">
        {/* Profile */}
        <ReviewCard icon={<User className="h-4 w-4" />} title="Profile & Registration" errors={validateRegistration(r)} onEdit={() => onEditStep(1)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center self-center overflow-hidden rounded-full border-2 border-border bg-shape-sky/40 text-2xl font-semibold text-primary sm:self-auto">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt="Profile photo" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-heading">{fullName}</p>
                <p className="text-xs text-body">
                  {r.providerType} <span className="mx-1.5 text-border">|</span> {r.specialty}
                </p>
                <p className="break-words text-xs text-body">
                  {r.email} <span className="mx-1.5 text-border">•</span> {phoneLabel(r.phoneCountry, r.phone)}
                </p>
              </div>
              <div className="space-y-2.5 sm:border-l sm:border-divider sm:pl-5">
                <Field label="Years of Experience">{r.experience}</Field>
                <Field label="Qualifications">{r.qualifications.join(", ") || "—"}</Field>
              </div>
            </div>
          </div>
        </ReviewCard>

        {/* Licenses */}
        <ReviewCard
          icon={<Medal className="h-4 w-4" />}
          title="Licenses & Credentials"
          errors={validateLicenses(l, { npi: r.npi, dea: r.dea })}
          onEdit={() => onEditStep(2)}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_1.2fr]">
            <Field label="NPI Number">{r.npi || "—"}</Field>
            <Field label="DEA Number">{r.dea || "—"}</Field>
            <div className="min-w-0">
              <p className="text-[11px] text-body">State Licenses ({l.licenses.length})</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {l.licenses.map((x) => (
                  <Tags key={x.id} text={`${stateName(x.state)} – ${x.number}`} tone="violet" size="xs" />
                ))}
              </div>
            </div>
            <Field label="Board Certification">{boards || "—"}</Field>
          </div>
        </ReviewCard>

        {/* Locations */}
        <ReviewCard icon={<MapPin className="h-4 w-4" />} title="Locations & Telemedicine" errors={validateLocationStep(loc)} onEdit={() => onEditStep(3)}>
          {primary ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <LocationThumb className="h-[84px] w-full sm:w-[130px]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-heading">
                  {primary.name}
                  {primary.primary && <Tags text="Primary" tone="success" size="xs" />}
                </p>
                <p className="flex items-start gap-2 text-xs text-body"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="break-words">{addressLabel(primary.address)}</span></p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body">
                  <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{phoneLabel(primary.phoneCountry, primary.phone)}</span>
                  <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 shrink-0" />{primary.department}</span>
                </p>
              </div>
              <div className="flex gap-6 sm:border-l sm:border-divider sm:pl-5">
                <Field label="Telemedicine">
                  <Tags text={loc.tele.enabled ? "Enabled" : "Disabled"} tone={loc.tele.enabled ? "success" : "neutral"} size="xs" />
                </Field>
                <Field label="Jurisdictions">{loc.tele.enabled ? jurisdictions.join(", ") || "—" : "—"}</Field>
              </div>
            </div>
          ) : (
            <p className="text-sm text-body">No practice locations added.</p>
          )}
        </ReviewCard>

        {/* Documents */}
        <ReviewCard icon={<FileText className="h-4 w-4" />} title="Documents" errors={validateDocuments(d)} onEdit={() => onEditStep(4)}>
          <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {shownDocs.map((f) => (
              <li key={f.id} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger"><FileText className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block max-w-[150px] truncate text-xs font-semibold text-heading" title={f.name}>{f.name}</span>
                  <span className="block text-[11px] text-body">{f.size}</span>
                </span>
              </li>
            ))}
            {d.files.length > shownDocs.length && (
              <li className="flex items-center"><Tags text={`+ ${d.files.length - shownDocs.length} more`} tone="violet" size="xs" /></li>
            )}
            {d.files.length === 0 && <li className="text-sm text-body">No documents uploaded.</li>}
          </ul>
        </ReviewCard>

        {/* Confirmation */}
        <div id="confirm" className={`${cardCls} sm:p-5`}>
          <label className="flex cursor-pointer items-start gap-3">
            <RadioCheckButtonh type="checkbox" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)} className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-heading">I confirm that the information provided is accurate and complete.</span>
              <span className="block text-xs text-body">
                By submitting, I agree to the KOOLMD{" "}
                <Link href="/provider-agreement" className="font-semibold text-link hover:text-primary hover:underline">Provider Agreement</Link>,{" "}
                <Link href="/privacy-policy" className="font-semibold text-link hover:text-primary hover:underline">Privacy Policy</Link>{" "}and{" "}
                <Link href="/credential-verification-terms" className="font-semibold text-link hover:text-primary hover:underline">Credential Verification Terms</Link>.
              </span>
            </span>
          </label>
          <FieldError message={error} />
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <aside className={`${cardCls} min-w-0 text-center sm:p-6`}>
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet/30 text-primary">
          <ClipboardCheck className="h-12 w-12" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-heading">Ready to Submit?</h3>
        <p className="mt-2 text-sm text-body">
          Your provider application is complete and ready for administrative review. Our team will verify your information and credentials before activating your account.
        </p>
        <ul className="mt-5 divide-y divide-divider text-left">
          {REVIEW_STEPS.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-semibold text-heading">{title}</span>
                <span className="block text-xs text-body">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default ProfileReview;