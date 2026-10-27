"use client";

import React, { useState } from "react";
import { Activity, Briefcase, Dumbbell, Droplet, Heart, Utensils, Wine, Cigarette, Globe } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";

import Tags, { type TagTone } from "@/components/Tags";
import ModalShell, {
  FormGrid,
  ModalRadioGroup,
  ModalSection,
  SignupDropdown,
  SignupField,
  OptLabel,
  toOptions,
} from "@/components/Modalshell";

/* ---------- Options ---------- */
const TOBACCO = [
  { value: "never", label: "Never smoked" },
  { value: "former", label: "Former smoker" },
  { value: "current", label: "Current smoker" },
];
const ALCOHOL = [
  { value: "none", label: "Does not drink" },
  { value: "occasional", label: "Occasional" },
  { value: "regular", label: "Regular" },
];
const EXERCISE = [
  { value: "none", label: "Does not exercise" },
  { value: "1-2", label: "1–2 times per week" },
  { value: "3-4", label: "3–4 times per week" },
  { value: "5+", label: "5+ times per week" },
];
const DRINK_FREQUENCY = toOptions(["Daily", "Weekly", "Monthly", "Special occasions only"]);
const DRINKS_PER_OCCASION = toOptions(["1", "2", "3–4", "5+"]);
const DIETS = toOptions(["Vegetarian", "Non-vegetarian", "Vegan", "Pescatarian", "Eggetarian", "Other"]);
const MARITAL = toOptions(["Single", "Married", "Divorced", "Widowed"]);
const BLOOD = toOptions(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const LANGUAGES = toOptions(["English", "Spanish", "French", "German", "Hindi"]);
const HEIGHT_UNITS = toOptions(["cm", "in"]);
const WEIGHT_UNITS = toOptions(["kg", "lb"]);

/* ---------- Form types ---------- */
export type LifestyleValues = {
  tobacco: string;
  packsPerDay: string;
  smokingYears: string;
  alcohol: string;
  drinkFrequency: string;
  drinksPerOccasion: string;
  exercise: string;
  diet: string;
  occupation: string;
  marital: string;
  blood: string;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  language: string;
};

const initial = (): LifestyleValues => ({
  tobacco: "never",
  packsPerDay: "",
  smokingYears: "",
  alcohol: "none",
  drinkFrequency: "",
  drinksPerOccasion: "",
  exercise: "3-4",
  diet: "Vegetarian",
  occupation: "Student",
  marital: "Single",
  blood: "B+",
  height: "165",
  heightUnit: "cm",
  weight: "58",
  weightUnit: "kg",
  language: "",
});

/** BMI from the entered height/weight (any unit). */
const calcBmi = (v: LifestyleValues): { value: string; label: string; tone: TagTone } | null => {
  const h = Number(v.height);
  const w = Number(v.weight);
  if (!(h > 0) || !(w > 0)) return null;
  const meters = (v.heightUnit === "in" ? h * 2.54 : h) / 100;
  const kg = v.weightUnit === "lb" ? w * 0.4536 : w;
  const bmi = kg / (meters * meters);
  if (!Number.isFinite(bmi)) return null;
  const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const tone: TagTone = label === "Normal" ? "success" : label === "Underweight" ? "info" : "warning";
  return { value: bmi.toFixed(1), label, tone };
};

/* ---------- Component ---------- */
const EditLifestyleModal = ({ onSave }: { onSave?: (values: LifestyleValues) => void }) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.dialog.EditLifestyle);

  const [values, setValues] = useState<LifestyleValues>(initial());

  const set = <K extends keyof LifestyleValues>(key: K, val: LifestyleValues[K]) =>
    setValues((p) => ({ ...p, [key]: val }));

  const bmi = calcBmi(values);

  const handleClose = () => {
    dispatch(hideModal("EditLifestyle"));
    setValues(initial());
  };

  const handleSave = () => {
    // TODO: call your API here
    console.log("Lifestyle saved:", values, bmi);
    onSave?.(values);
    handleClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSave}
      title="Edit Lifestyle & Social History"
      subtitle="Update the patient's lifestyle and social history information."
      submitText="Save Changes"
      width={760}
    >
      <div className="space-y-3">
        {/* Tobacco */}
        <ModalSection icon={<Cigarette className="h-4 w-4" />} title="Tobacco Use">
          <ModalRadioGroup
            name="tobacco"
            label=""
            value={values.tobacco}
            onChange={(v) => set("tobacco", v)}
            options={TOBACCO}
            className="grid grid-cols-1 sm:flex sm:items-center sm:gap-x-6 gap-y-2.5"
          />
          <div className="mt-3">
            <FormGrid>
              <SignupField
                name="packsPerDay"
                type="number"
                label={<OptLabel>Packs per day</OptLabel>}
                placeholder="Enter packs per day"
                value={values.packsPerDay}
                onChange={(e) => set("packsPerDay", e.target.value)}
                disabled={values.tobacco === "never"}
              />
              <SignupField
                name="smokingYears"
                type="number"
                label={<OptLabel>Years</OptLabel>}
                placeholder="Enter number of years"
                value={values.smokingYears}
                onChange={(e) => set("smokingYears", e.target.value)}
                disabled={values.tobacco === "never"}
              />
            </FormGrid>
          </div>
        </ModalSection>

        {/* Alcohol */}
        <ModalSection icon={<Wine className="h-4 w-4" />} title="Alcohol Use">
          <ModalRadioGroup
            name="alcohol"
            label=""
            value={values.alcohol}
            onChange={(v) => set("alcohol", v)}
            options={ALCOHOL}
            className="grid grid-cols-1 sm:flex sm:items-center sm:gap-x-6 gap-y-2.5"
          />
          <div className="mt-3">
            <FormGrid>
              <SignupDropdown
                name="drinkFrequency"
                label={<OptLabel>Frequency</OptLabel>}
                placeholder="Select frequency"
                searchable={false}
                options={DRINK_FREQUENCY}
                value={values.drinkFrequency}
                onChange={(v) => set("drinkFrequency", v)}
                disabled={values.alcohol === "none"}
              />
              <SignupDropdown
                name="drinksPerOccasion"
                label={<OptLabel>Drinks per occasion</OptLabel>}
                placeholder="Select number"
                searchable={false}
                options={DRINKS_PER_OCCASION}
                value={values.drinksPerOccasion}
                onChange={(v) => set("drinksPerOccasion", v)}
                disabled={values.alcohol === "none"}
              />
            </FormGrid>
          </div>
        </ModalSection>

        {/* Exercise */}
        <ModalSection icon={<Dumbbell className="h-4 w-4" />} title="Exercise">
          <ModalRadioGroup
            name="exercise"
            label=""
            value={values.exercise}
            onChange={(v) => set("exercise", v)}
            options={EXERCISE}
            className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:gap-x-5 xl:gap-x-6 gap-y-2.5 gap-x-4"
          />
        </ModalSection>

        {/* Diet + occupation */}
        <FormGrid>
          <ModalSection icon={<Utensils className="h-4 w-4" />} title="Diet">
            <SignupDropdown
              name="diet"
              label="Diet Type"
              placeholder="Select diet type"
              searchable={false}
              options={DIETS}
              value={values.diet}
              onChange={(v) => set("diet", v)}
            />
          </ModalSection>
          <ModalSection icon={<Briefcase className="h-4 w-4" />} title="Occupation">
            <SignupField
              name="occupation"
              label="Occupation"
              placeholder="Enter occupation"
              value={values.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </ModalSection>

          <ModalSection icon={<Heart className="h-4 w-4" />} title="Marital Status">
            <SignupDropdown
              name="marital"
              label="Status"
              placeholder="Select marital status"
              searchable={false}
              options={MARITAL}
              value={values.marital}
              onChange={(v) => set("marital", v)}
            />
          </ModalSection>
          <ModalSection icon={<Droplet className="h-4 w-4" />} title="Blood Type">
            <SignupDropdown
              name="blood"
              label="Blood Type"
              placeholder="Select blood type"
              searchable={false}
              options={BLOOD}
              value={values.blood}
              onChange={(v) => set("blood", v)}
            />
          </ModalSection>
        </FormGrid>

        {/* Height / weight / BMI */}
        <div className="grid gap-3 sm:grid-cols-3">
          <ModalSection title="Height">
            <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2">
              <SignupField
                name="height"
                type="number"
                label="Height"
                placeholder="165"
                value={values.height}
                onChange={(e) => set("height", e.target.value)}
              />
              <SignupDropdown
                name="heightUnit"
                label="Unit"
                searchable={false}
                options={HEIGHT_UNITS}
                value={values.heightUnit}
                onChange={(v) => set("heightUnit", v)}
              />
            </div>
          </ModalSection>
          <ModalSection title="Weight">
            <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2">
              <SignupField
                name="weight"
                type="number"
                label="Weight"
                placeholder="58"
                value={values.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
              <SignupDropdown
                name="weightUnit"
                label="Unit"
                searchable={false}
                options={WEIGHT_UNITS}
                value={values.weightUnit}
                onChange={(v) => set("weightUnit", v)}
              />
            </div>
          </ModalSection>
          <ModalSection icon={<Activity className="h-4 w-4" />} title="BMI">
            <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-border bg-primary/[0.06] px-4">
              <span className="text-sm font-medium text-heading">{bmi ? bmi.value : "—"}</span>
              {bmi && <Tags text={bmi.label} tone={bmi.tone} size="xs" />}
            </div>
          </ModalSection>
        </div>

        {/* Language */}
        <ModalSection icon={<Globe className="h-4 w-4" />} title="Preferred Language">
          <SignupDropdown
            name="language"
            label="Preferred Language"
            placeholder="Not provided"
            searchable={false}
            options={LANGUAGES}
            value={values.language}
            onChange={(v) => set("language", v)}
          />
        </ModalSection>
      </div>
    </ModalShell>
  );
};

export default EditLifestyleModal;