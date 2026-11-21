"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarX } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tabs from "@/components/Tabs";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { type Errors } from "@/providers/Shared";

import WeeklySchedule, { initialWeekly, validateWeekly, type WeeklyValues } from "./WeeklySchedule";
import AvailabilityExceptions, { initialExceptions } from "./AvailabilityExceptions";
import { type AvailabilityException } from "./AddExceptionModal";

type Tab = "weekly" | "exceptions";

const TABS: { key: Tab; label: string; Icon: typeof Calendar }[] = [
  { key: "weekly", label: "Weekly Schedule", Icon: Calendar },
  { key: "exceptions", label: "Exceptions & Time Off", Icon: CalendarX },
];

type ToastState = { type: "success" | "error" | null; title: string; message: string };

const ConfigureAvailability = () => {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("weekly");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  const [weekly, setWeekly] = useState<WeeklyValues>(initialWeekly());
  const [exceptions, setExceptions] = useState<AvailabilityException[]>(initialExceptions());

  const handleSave = async () => {
    if (isSaving) return;

    const errs = validateWeekly(weekly);
    if (Object.keys(errs).length) {
      setTab("weekly");
      setErrors(errs);
      setToast({ type: "error", title: "Validation Incomplete", message: "Please fix the highlighted fields in your weekly schedule." });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: call your API here
      console.log("Availability saved:", { weekly, exceptions });
      setToast({ type: "success", title: "Availability saved", message: "Your availability has been updated." });
    } catch (error) {
      setToast({
        type: "error",
        title: "Could not save availability",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SuccessToast
        isOpen={toast.type === "success"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />
      <ErrorToast
        isOpen={toast.type === "error"}
        onClose={() => setToast((p) => ({ ...p, type: null }))}
        title={toast.title}
        message={toast.message}
      />

      <div className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 sm:space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">Configure Availability</h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Set your working hours, consultation types and appointment preferences.
          </p>
        </div>

        {/* Tabs */}
        <Tabs ariaLabel="Availability sections">
          <div className="flex min-w-max gap-1 sm:gap-3">
            {TABS.map(({ key, label, Icon }) => {
              const isActive = key === tab;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setTab(key)}
                  className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-4 sm:pb-3 ${
                    isActive ? "border-primary font-semibold text-primary" : "border-transparent text-body hover:text-heading"
                  }`}
                >
                  <Icon className="hidden h-4 w-4 shrink-0 sm:block" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </Tabs>

        <div role="tabpanel">
          {tab === "weekly" ? (
            <WeeklySchedule
              values={weekly}
              errors={errors}
              onChange={(patch) => {
                setWeekly((p) => ({ ...p, ...patch }));
                setErrors({});
              }}
            />
          ) : (
            <AvailabilityExceptions exceptions={exceptions} onChange={setExceptions} />
          )}
        </div>
      </div>

      {/* Sticky bottom buttons */}
      <div className="sticky -bottom-4 z-[250] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-2 sm:gap-3">
          <ImportButton text="Cancel" icon={null} onClick={() => router.back()} className="shrink-0 whitespace-nowrap px-3 sm:px-5" />
          <AddButton
            text={isSaving ? "Saving…" : "Save Availability"}
            icon={null}
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 whitespace-nowrap px-3 sm:px-5"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigureAvailability;