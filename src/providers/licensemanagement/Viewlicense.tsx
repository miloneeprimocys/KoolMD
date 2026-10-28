"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download, Pencil, Trash2 } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import Breadcrumb from "@/components/Breadcrumb";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showDeleteLicense } from "@/redux/slices/dialogslice";

import { PROVIDERS, SAMPLE_LICENSE, stateLabel } from "./addlicense/Licenseinformation";
import { LicenseDetails, type LicenseDetailsData } from "./addlicense/Reviewsave";
import { VerificationTimeline } from "./addlicense/Licenseverification";

const LIST_ROUTE = "/provider/license-management";

/* TODO: replace with data loaded by ?id= from your API / redux selector */
const provider = PROVIDERS.find((p) => p.id === SAMPLE_LICENSE.providerId) ?? PROVIDERS[0];

const DATA: LicenseDetailsData = {
  provider: { ...provider, status: SAMPLE_LICENSE.status },
  state: stateLabel(SAMPLE_LICENSE.state),
  licenseNumber: SAMPLE_LICENSE.licenseNumber,
  licenseType: SAMPLE_LICENSE.licenseType,
  issueDate: SAMPLE_LICENSE.issueDate,
  expiryDate: SAMPLE_LICENSE.expiryDate,
  status: SAMPLE_LICENSE.status,
  verificationStatus: "Verified",
  licenseSource: "State Medical Board",
  lastVerifiedOn: "2024-01-20",
  notes: SAMPLE_LICENSE.notes,
  document: { name: "CA_License.pdf", uploadedOn: "2024-01-15" },
};

const TIMELINE = [
  { label: "Document Submitted", date: "2024-01-15" },
  { label: "Administrative Review", date: "2024-01-18" },
  { label: "State Verification", date: "2024-01-20" },
  { label: "Verified", date: "2024-01-20" },
];

const ViewLicense = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [moreOpen, setMoreOpen] = useState(false);

  const menuItemCls =
    "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-heading transition-colors hover:bg-primary/10";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "License Management", href: LIST_ROUTE },
          { label: "License Details" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">License Details</h2>

        <div className="flex items-center gap-2">
          <ImportButton
            text="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push("/provider/license-management/edit")}
            className="whitespace-nowrap px-4"
          />
          <div className="relative">
            <ImportButton
              text="More"
              icon={<ChevronDown className="h-4 w-4" />}
              onClick={() => setMoreOpen((o) => !o)}
              className="whitespace-nowrap px-4"
            />
            {moreOpen && (
              <div className="absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
                <button type="button" className={menuItemCls} onClick={() => setMoreOpen(false)}>
                  <Download className="h-4 w-4" /> Download 
                </button>
                <button
                  type="button"
                  className={`${menuItemCls} !text-danger`}
                  onClick={() => {
                    setMoreOpen(false);
                    dispatch(
                      showDeleteLicense({
                        id: searchParams.get("id") ?? "license-detail",
                        provider: DATA.provider.name,
                        licenseNumber: DATA.licenseNumber,
                        state: DATA.state,
                        licenseType: DATA.licenseType,
                      }),
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete License
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LicenseDetails
        data={DATA}
        below={
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-4 text-sm font-semibold text-heading">Verification Timeline</h4>
            <VerificationTimeline steps={TIMELINE} />
          </div>
        }
      />
    </div>
  );
};

export default ViewLicense;


