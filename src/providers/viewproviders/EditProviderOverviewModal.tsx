"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import ModalShell, { FormGrid, FullRow, OptLabel } from "@/components/Modalshell";
import FileDropzone from "@/components/Filedropzone";
import SignupField from "@/components/SignupField";
import { DEFAULT_COUNTRY, PhoneField, ChipSelect } from "@/providers/Shared";
import { useSpecialtyOptions } from "@/providers/useProviderCatalogs";

const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "Mandarin", "Arabic", "Hindi", "Portuguese"].map((language) => ({
  value: language,
  label: language,
}));

const SECTION_FIELDS: Record<string, { label: string; value: string; multiline?: boolean }[]> = {
  "Personal Information": [
    { label: "Full Name", value: "Dr. Michael Brown" },
    { label: "Gender", value: "Male" },
    { label: "Date of Birth", value: "Apr 12, 1982" },
    { label: "Provider Type", value: "Physician (MD)" },
    { label: "Bio", value: "Board-certified Internal Medicine physician with 10+ years of experience in Primary Care, Preventive Medicine and Chronic Disease Management.", multiline: true },
  ],
  "Professional Information": [
    { label: "NPI Number", value: "1234567890" },
    { label: "DEA Number", value: "AB1234567" },
    { label: "State License", value: "MD123456 (California)" },
    { label: "Board Certification", value: "American Board of Internal Medicine" },
    { label: "Years of Experience", value: "10+ years" },
  ],
  "Contact Information": [
    { label: "Email", value: "michael.brown@sunrisehealth.com" },
    { label: "Address", value: "1234 Medical Center Dr, Suite 500, Los Angeles, CA 90025, USA", multiline: true },
  ],
  "Practice Information": [
    { label: "Practice Name", value: "Sunrise Medical Group" },
    { label: "Practice Location", value: "Los Angeles, CA" },
    { label: "Department", value: "Internal Medicine" },
    { label: "Tax ID", value: "98-7654321" },
  ],
};

const EditProviderOverviewModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.EditProviderOverview);
  const section = useAppSelector((state) => state.dialog.providerOverviewSection);
  const { specialtyOptions } = useSpecialtyOptions();
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("415 555 0198");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [specialties, setSpecialties] = useState<string[]>(["Internal Medicine"]);
  const [languages, setLanguages] = useState<string[]>(["English", "Spanish"]);
  const close = () => dispatch(hideModal("EditProviderOverview"));

  const isMediaSection = section === "Profile Photo & Signature";
  const fields = section ? SECTION_FIELDS[section] : [];

  useEffect(() => {
    if (!open) return;
    setPhoneCountry(DEFAULT_COUNTRY);
    setPhone("415 555 0198");
    setProfilePhoto(null);
    setSignature(null);
    const overviewSpecialties = ["Internal Medicine", "Primary Care", "Preventive Care"];
    const catalogSpecialties = specialtyOptions
      .filter((specialty) => overviewSpecialties.includes(specialty.label))
      .map((specialty) => specialty.value);
    setSpecialties(catalogSpecialties.length ? catalogSpecialties : ["Internal Medicine"]);
    setLanguages(["English", "Spanish"]);
  }, [open, section, specialtyOptions]);

  return (
    <ModalShell
      open={open}
      onClose={close}
      onSubmit={close}
      title={`Edit ${section ?? "Provider Information"}`}
      subtitle={isMediaSection ? "Upload a profile photo and digital signature." : "Update the provider information below."}
      submitText="Save Changes"
      width={720}
    >
      {isMediaSection ? (
        <FormGrid>
          <FullRow>
            <div>
              <p className="mb-2 text-sm font-medium text-label">Profile Photo</p>
              <FileDropzone variant="attachment" title="Drop a profile photo here or browse files" file={profilePhoto} onChange={setProfilePhoto} maxSizeMB={2} />
            </div>
          </FullRow>
          <FullRow>
            <div>
              <p className="mb-2 text-sm font-medium text-label">Digital Signature</p>
              <FileDropzone variant="attachment" title="Drop a signature image here or browse files" file={signature} onChange={setSignature} maxSizeMB={2} />
            </div>
          </FullRow>
        </FormGrid>
      ) : (
        <FormGrid>
          {section === "Contact Information" && (
            <FullRow>
              <PhoneField
                name="phone"
                label={<OptLabel>Phone Number</OptLabel>}
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                countryCode={phoneCountry}
                onCountryChange={setPhoneCountry}
              />
            </FullRow>
          )}
          {section === "Personal Information" && (
            <FullRow>
              <ChipSelect
                name="specialties"
                label="Specialties"
                placeholder="Select specialties"
                options={specialtyOptions}
                value={specialties}
                onChange={setSpecialties}
              />
            </FullRow>
          )}
          {section === "Professional Information" && (
            <FullRow>
              <ChipSelect
                name="languages"
                label="Languages"
                placeholder="Select languages"
                options={LANGUAGE_OPTIONS}
                value={languages}
                onChange={setLanguages}
              />
            </FullRow>
          )}
          {fields.map((field) => (
            <FullRow key={field.label}>
              <SignupField
                name={field.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}
                label={field.label}
                defaultValue={field.value}
                multiline={field.multiline}
                rows={field.multiline ? 3 : undefined}
              />
            </FullRow>
          ))}
        </FormGrid>
      )}
    </ModalShell>
  );
};

export default EditProviderOverviewModal;
