"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import { cardCls } from "../Shared";

import {
  LicenseFields,
  SAMPLE_LICENSE,
  validateLicense,
  type LicenseValues,
} from "./addlicense/Licenseinformation";

const LIST_ROUTE = "/provider/license-management";

type Errors = Record<string, string>;
type ToastState = { type: "success" | "error" | null; title: string; message: string };

const EditLicense = () => {
  const router = useRouter();

  // TODO: load by ?id= from your API / redux selector
  const [values, setValues] = useState<LicenseValues>(SAMPLE_LICENSE);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  const handleSave = async () => {
    if (isSaving) return;
    const errs = validateLicense(values, false);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      setToast({ type: "error", title: "Validation Incomplete", message: "Please fix the highlighted fields." });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: call your update API here
      console.log("License updated:", values);
      setToast({ type: "success", title: "License updated", message: "Changes saved successfully." });
      setTimeout(() => router.push(LIST_ROUTE), 800);
    } catch (error) {
      setToast({
        type: "error",
        title: "Could not update license",
        message: error instanceof Error ? error.message : "Something went wrong. Try again.",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
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

      <Breadcrumb
        items={[
          { label: "License Management", href: LIST_ROUTE },
          { label: "Edit License" },
        ]}
      />

      <section className={`${cardCls} sm:p-6`}>
        <h2 className="mb-4 text-base font-semibold text-heading sm:text-lg">Edit License</h2>

        <LicenseFields
          values={values}
          errors={errors}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
        />

        <div className="mt-6 flex items-center justify-between gap-3">
          <ImportButton
            text="Cancel"
            icon={null}
            onClick={() => router.push(LIST_ROUTE)}
            className="shrink-0 whitespace-nowrap px-5"
          />
          <AddButton
            text={isSaving ? "Saving…" : "Save Changes"}
            icon={null}
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 whitespace-nowrap px-5"
          />
        </div>
      </section>
    </div>
  );
};

export default EditLicense;

