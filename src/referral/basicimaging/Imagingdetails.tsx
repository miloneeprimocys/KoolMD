"use client";

import React from "react";
import { Search } from "lucide-react";

import SignupField from "@/components/SignupField";
import SignupDropdown from "@/components/SignupDropdown";
import { ModalCheckboxGroup, ModalRadioGroup } from "@/components/Modalshell";
import { Opt, Req, TextArea, cardCls, toOptions, type Errors, type StepProps } from "@/providers/Shared";
import {
  BODY_PARTS,
  ImagingTypePicker,
  LATERALITY_OPTIONS,
  PRIORITIES,
  VIEW_OPTIONS,
  imagingTypePatch,
  procedureOptions,
  procedurePatch,
  type ImagingValues,
} from "./Imagingpatient";

const CONTRAST_OPTIONS = toOptions(["No Contrast", "With Contrast", "With and Without Contrast"]);

/* ---------- Validation ---------- */
export const validateImagingDetails = (v: ImagingValues): Errors => {
  const e: Errors = {};
  if (!v.imagingType) e.imagingType = "Select an imaging type.";
  if (!v.procedure) e.procedure = "Select a procedure / study.";
  if (v.views.length === 0) e.views = "Select at least one view.";
  else if (v.views.includes("Other") && !v.otherView.trim()) e.otherView = "Specify the other view.";
  if (!v.bodyPart) e.bodyPart = "Select a body part.";
  if (!v.laterality) e.laterality = "Select laterality.";
  if (!v.reason.trim()) e.reason = "Reason for exam is required.";
  return e;
};

/* ---------- Component ---------- */
const ImagingDetailsStep = ({ values: v, errors, onChange }: StepProps<ImagingValues>) => (
  <section className={`${cardCls} space-y-5 sm:p-6`}>
    <h3 className="text-base font-semibold text-heading sm:text-lg">Imaging Details</h3>

    <div>
      <p className="mb-2 text-sm font-medium text-label">
        Imaging Type<Req />
      </p>
      <ImagingTypePicker
        value={v.imagingType}
        onChange={(t) => onChange(imagingTypePatch(v, t))}
        error={errors.imagingType}
      />
    </div>

    <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
      <SignupDropdown
        name="procedure"
        label={<>Procedure / Study<Req /></>}
        icon={<Search className="h-4 w-4" />}
        placeholder="Search procedure or study..."
        options={procedureOptions(v.imagingType)}
        value={v.procedure}
        onChange={(val) => onChange(procedurePatch(val, v.imagingType))}
        error={errors.procedure}
      />
      <SignupField
        name="cptCode"
        label={<>CPT Code<Opt /></>}
        placeholder="Enter CPT code"
        value={v.cptCode}
        onChange={(e) => onChange({ cptCode: e.target.value })}
      />
    </div>

    <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Left: series / views */}
      <div className="space-y-3">
        <ModalCheckboxGroup
          label={<>Series / Views<Req /></>}
          value={v.views}
          onChange={(val) => onChange({ views: val })}
          options={VIEW_OPTIONS}
          className="space-y-3"
        />
        {v.views.includes("Other") && (
          <SignupField
            name="otherView"
            label="Specify view"
            placeholder="Specify view..."
            value={v.otherView}
            onChange={(e) => onChange({ otherView: e.target.value })}
            error={errors.otherView}
          />
        )}
        {errors.views && <p className="text-xs text-danger">{errors.views}</p>}
      </div>

      {/* Right: body part, laterality, contrast, priority */}
      <div className="space-y-4">
        <SignupDropdown
          name="bodyPart"
          label={<>Body Part<Req /></>}
          placeholder="Select body part"
          searchable={false}
          options={BODY_PARTS}
          value={v.bodyPart}
          onChange={(val) => onChange({ bodyPart: val })}
          error={errors.bodyPart}
        />
        <ModalRadioGroup
          name="laterality"
          label={<>Laterality<Req /></>}
          value={v.laterality}
          onChange={(val) => onChange({ laterality: val })}
          options={LATERALITY_OPTIONS}
          error={errors.laterality}
          className="h-10"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SignupDropdown
            name="contrast"
            label="Contrast"
            placeholder="Select contrast"
            searchable={false}
            options={CONTRAST_OPTIONS}
            value={v.contrast}
            onChange={(val) => onChange({ contrast: val })}
          />
          <SignupDropdown
            name="priority"
            label="Priority"
            placeholder="Select priority"
            searchable={false}
            options={PRIORITIES}
            value={v.priority}
            onChange={(val) => onChange({ priority: val })}
          />
        </div>
      </div>
    </div>

    <TextArea
      name="reason"
      label={<>Reason for Exam / Clinical Indication<Req /></>}
      placeholder="e.g. Evaluate for right knee pain – rule out fracture."
      value={v.reason}
      onChange={(val) => onChange({ reason: val })}
      maxLength={500}
      rows={3}
      error={errors.reason}
    />
  </section>
);

export default ImagingDetailsStep;
