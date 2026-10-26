"use client";

import React, { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, GripVertical, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { ModalTextarea, ReqLabel, SignupField } from "@/components/Modalshell";
import { useAppSelector } from "@/hooks/useAppHooks";

import { PlanIcon, type IconKey } from "../Viewmembershipplan";

const PLANS_ROUTE = "/membership/plans";

/** Icons shown in the picker by default / after pressing "…". */
const MAIN_ICONS: IconKey[] = ["crown", "gem", "users", "heart", "leaf"];
const EXTRA_ICONS: IconKey[] = ["graduation", "star", "shield", "award", "sparkles"];

/* ---------- Static data ---------- */
const PLAN_TYPES = ["Monthly", "Annual"] as const;
type PlanType = (typeof PLAN_TYPES)[number];

/** Pricing comes from the "Pricing & Billing" step — shown here as a fixed example in the preview. */
const PREVIEW_PRICE = "$49.00";
const PREVIEW_CYCLE = "month";
const PREVIEW_BADGE = "Monthly";

type Benefit = { id: string; text: string };

const INITIAL_BENEFITS: Benefit[] = [
  { id: "b1", text: "30% discount on appointment payments" },
  { id: "b2", text: "Priority appointment booking" },
  { id: "b3", text: "Access to exclusive member events" },
  { id: "b4", text: "Waived consultation fee for follow-up visits" },
  { id: "b5", text: "Dedicated care support" },
];

/* ---------- Page ---------- */
const CreateMembershipPlan = () => {
  const router = useRouter();
  const pathname = usePathname();
  const planId = useSearchParams().get("id");
  const selectedPlan = useAppSelector((state) => state.dialog.membershipPlanTarget);
  const isEditMode = pathname === "/membership/plans/edit";
  const editPlan = isEditMode && selectedPlan?.id === planId ? selectedPlan : null;
  const idSeed = useRef(100);

  const [name, setName] = useState(editPlan?.name ?? "Premium Care Plan");
  const [type, setType] = useState<PlanType>(editPlan?.cycle === "Annual" || editPlan?.cycle === "Yearly" ? "Annual" : "Monthly");
  const [description, setDescription] = useState(editPlan?.description ?? "Comprehensive care with discounted consultation fees and exclusive member benefits.");
  const [icon, setIcon] = useState<IconKey>(editPlan?.icon ?? "crown");
  const [showMoreIcons, setShowMoreIcons] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>(
    editPlan?.benefits.map((text: string, index: number) => ({ id: `b${index + 1}`, text })) ?? INITIAL_BENEFITS,
  );

  /* Drag-to-reorder (the grip arms the row, so typing in the field never starts a drag) */
  const [armedId, setArmedId] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const setBenefit = (id: string, text: string) =>
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));

  const addBenefit = () =>
    setBenefits((prev) => [...prev, { id: `b${idSeed.current++}`, text: "" }]);

  const removeBenefit = (id: string) => setBenefits((prev) => prev.filter((b) => b.id !== id));

  const dropOn = (to: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    setArmedId(null);
    if (from === null || from === to) return;
    setBenefits((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const iconChoices = showMoreIcons ? [...MAIN_ICONS, ...EXTRA_ICONS] : MAIN_ICONS;
  const previewBenefits = benefits.map((b) => b.text.trim()).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing & Payments", href: "/payment/payment-gateway" },
          { label: "Membership Plans", href: PLANS_ROUTE },
            { label: `${isEditMode ? "Edit" : "Create"} Membership Plan` },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">{isEditMode ? "Edit Membership Plan" : "Create Membership Plan"}</h2>
        <p className="mt-0.5 text-sm text-body">{isEditMode ? "Update the membership plan details for your patients." : "Set up a new membership plan for your patients."}</p>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        {/* ================= LEFT: Plan details ================= */}
        <section className="min-w-0 rounded-[14px] border border-border bg-card p-4 sm:p-6">
          <h3 className="text-base font-semibold text-heading">Plan Details</h3>
          <p className="mt-0.5 text-xs text-body">Enter the basic information for the membership plan.</p>

          <div className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <SignupField
                name="planName"
                label={<ReqLabel>Plan Name</ReqLabel>}
                placeholder="Enter plan name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-label">
                  <ReqLabel>Plan Type</ReqLabel>
                </p>
                <div role="radiogroup" aria-label="Plan type" className="grid h-12 grid-cols-2 rounded-xl border border-border bg-card">
                  {PLAN_TYPES.map((t) => {
                    const active = t === type;
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setType(t)}
                        className={`cursor-pointer border-r border-border text-sm font-medium transition-colors first:rounded-l-[11px] last:rounded-r-[11px] last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 ${
                          active ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary" : "text-heading hover:bg-primary/5"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <ModalTextarea
              id="plan-description"
              label={<ReqLabel>Description</ReqLabel>}
              placeholder="Describe what this plan offers"
              value={description}
              onChange={setDescription}
              maxLength={250}
            />

            {/* Plan icon */}
            <div>
              <h4 className="text-sm font-semibold text-heading">Plan Icon</h4>
              <p className="mb-3 mt-0.5 text-xs text-body">Choose an icon to represent this plan.</p>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Plan icon">
                {iconChoices.map((key) => {
                  const active = key === icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={key}
                      onClick={() => setIcon(key)}
                      className={`cursor-pointer rounded-xl border-2 p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        active ? "border-primary" : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <PlanIcon icon={key} size="h-11 w-11" iconSize="h-5 w-5" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-label={showMoreIcons ? "Show fewer icons" : "Show more icons"}
                  aria-expanded={showMoreIcons}
                  onClick={() => setShowMoreIcons((v) => !v)}
                  className="cursor-pointer rounded-xl border-2 border-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-heading/10 text-body">
                    <MoreHorizontal className="h-5 w-5" />
                  </span>
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-sm font-semibold text-heading">Membership Benefits</h4>
              <p className="mb-3 mt-0.5 text-xs text-body">
                Add the benefits included in this plan. These will be shown to patients.
              </p>

              <ul className="space-y-1">
                {benefits.map((b, index) => (
                  <li
                    key={b.id}
                    draggable={armedId === b.id}
                    onDragStart={() => (dragFrom.current = index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(index);
                    }}
                    onDrop={() => dropOn(index)}
                    onDragEnd={() => {
                      dragFrom.current = null;
                      setDragOver(null);
                      setArmedId(null);
                    }}
                    className={`flex items-start gap-2 rounded-xl ${dragOver === index ? "bg-primary/10" : ""}`}
                  >
                    <button
                      type="button"
                      aria-label={`Drag to reorder benefit ${index + 1}`}
                      onMouseDown={() => setArmedId(b.id)}
                      onMouseUp={() => setArmedId(null)}
                      className="mt-3.5 shrink-0 cursor-grab text-body focus-visible:outline-none"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <SignupField
                        name={`benefit-${b.id}`}
                        placeholder="Describe a benefit"
                        value={b.text}
                        onChange={(e) => setBenefit(b.id, e.target.value)}
                        trailing={
                          <button
                            type="button"
                            aria-label={`Remove benefit ${index + 1}`}
                            onClick={() => removeBenefit(b.id)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <ImportButton
                className="mt-2 w-fit text-primary"
                text="Add Benefit"
                icon={<Plus className="h-4 w-4" />}
                onClick={addBenefit}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ImportButton text="Cancel" icon={null} onClick={() => router.push(PLANS_ROUTE)} />
            <AddButton
              text={isEditMode ? "Save Changes" : "Next: Pricing & Billing"}
              icon={isEditMode ? null : <ArrowRight className="h-4 w-4" />}
              onClick={() => {
                if (isEditMode) router.push(PLANS_ROUTE);
                else {
                  /* TODO: go to the Pricing & Billing step */
                }
              }}
              className="whitespace-nowrap"
            />
          </div>
        </section>

        {/* ================= RIGHT: Plan preview ================= */}
        <section className="min-w-0 rounded-[14px] border border-border bg-card p-4 sm:p-5 xl:sticky xl:top-4">
          <h3 className="text-base font-semibold text-heading">Plan Preview</h3>
          <p className="mt-0.5 text-xs text-body">This is how your plan will appear to patients.</p>

          <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <PlanIcon icon={icon} size="h-14 w-14" iconSize="h-7 w-7" rounded="rounded-full" />
              <span className="rounded-md bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                {PREVIEW_BADGE}
              </span>
            </div>

            <h4 className="mt-4 text-base font-semibold text-heading">{name.trim() || "Untitled plan"}</h4>
            <p className="mt-1 text-2xl font-bold text-heading">
              {PREVIEW_PRICE} <span className="text-sm font-normal text-body">/ {PREVIEW_CYCLE}</span>
            </p>

            <hr className="my-4 border-divider" />

            <p className="text-sm text-body">{description.trim() || "Plan description will appear here."}</p>

            <ul className="mt-4 space-y-3">
              {previewBenefits.length === 0 && (
                <li className="text-sm text-body">Benefits you add will appear here.</li>
              )}
              {previewBenefits.map((benefit, i) => (
                <li key={`${benefit}-${i}`} className="flex items-start gap-3 text-sm text-heading">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* keeps the selected type visible in the preview, like the saved plan card would */}
          <p className="mt-3 text-xs text-body">
            Plan type: <span className="font-medium text-heading">{type}</span>
          </p>
        </section>
      </div>
    </div>
  );
};

export default CreateMembershipPlan;
