"use client";

import React from "react";
import { Pencil, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { cardCls } from "@/providers/Shared";

const ReviewSubmit = () => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px] xl:gap-5">
      <div className="space-y-4 sm:space-y-5">
        {/* Patient Info */}
        <section className={`${cardCls} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Patient Information</h3>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-body text-xs">Name</p>
              <p className="font-medium text-heading">John Smith</p>
            </div>
            <div>
              <p className="text-body text-xs">Patient ID</p>
              <p className="font-medium text-heading">#PT-000125</p>
            </div>
            <div>
              <p className="text-body text-xs">Date of Birth</p>
              <p className="font-medium text-heading">Jan 15, 1980</p>
            </div>
            <div>
              <p className="text-body text-xs">Gender</p>
              <p className="font-medium text-heading">Male</p>
            </div>
            <div>
              <p className="text-body text-xs">Phone</p>
              <p className="font-medium text-heading">(555) 123-4567</p>
            </div>
            <div>
              <p className="text-body text-xs">Address</p>
              <p className="font-medium text-heading">123 Main St, Austin, TX 78701</p>
            </div>
          </div>
        </section>

        {/* Insurance Info */}
        <section className={`${cardCls} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Insurance Information</h3>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-body text-xs">Payer</p>
              <p className="font-medium text-heading">Blue Cross Blue Shield</p>
            </div>
            <div>
              <p className="text-body text-xs">Payer ID</p>
              <p className="font-medium text-heading">00324</p>
            </div>
            <div>
              <p className="text-body text-xs">Member ID</p>
              <p className="font-medium text-heading">ABC123456789</p>
            </div>
            <div>
              <p className="text-body text-xs">Group Number</p>
              <p className="font-medium text-heading">GRP987654</p>
            </div>
            <div>
              <p className="text-body text-xs">Plan Name</p>
              <p className="font-medium text-heading">PPO Blue Preferred</p>
            </div>
            <div>
              <p className="text-body text-xs">Policy Holder</p>
              <p className="font-medium text-heading">Self</p>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className={`${cardCls} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Service Details</h3>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm mb-4">
            <div>
              <p className="text-body text-xs">Service Date</p>
              <p className="font-medium text-heading">Apr 15, 2024</p>
            </div>
            <div>
              <p className="text-body text-xs">Place of Service</p>
              <p className="font-medium text-heading">11 - Office</p>
            </div>
            <div>
              <p className="text-body text-xs">Rendering Provider</p>
              <p className="font-medium text-heading">Dr. John Doe</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border mt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-heading/5 text-xs text-body">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">CPT/HCPCS</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Modifiers</th>
                  <th className="px-3 py-2 font-medium">Diagnosis</th>
                  <th className="px-3 py-2 font-medium text-center">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2 text-body">1</td>
                  <td className="px-3 py-2 font-medium">99213</td>
                  <td className="px-3 py-2">Office or other outpatient visit...</td>
                  <td className="px-3 py-2">25</td>
                  <td className="px-3 py-2">M54.5</td>
                  <td className="px-3 py-2 text-center">1</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-body">2</td>
                  <td className="px-3 py-2 font-medium">97110</td>
                  <td className="px-3 py-2">Therapeutic exercises</td>
                  <td className="px-3 py-2">GP</td>
                  <td className="px-3 py-2">M54.5</td>
                  <td className="px-3 py-2 text-center">1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Additional Info */}
        <section className={`${cardCls} p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Additional Options</h3>
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-body text-xs">Include Specific Service</p>
              <p className="font-medium text-heading">No (General Eligibility)</p>
            </div>
            <div>
              <p className="text-body text-xs">Save to Patient History</p>
              <p className="font-medium text-heading">Yes</p>
            </div>
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden xl:block">
        <div className={`${cardCls} p-5 sticky top-24 space-y-4`}>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-base font-semibold">Ready to Submit?</h3>
          </div>
          <p className="text-xs text-body">
            This will send a real-time eligibility request through the configured clearinghouse.
          </p>

          <div className="rounded-xl bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-heading">
              <RefreshCw className="h-4 w-4 text-primary" />
              Change Healthcare
            </div>
            <p className="text-[11px] text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </p>
            <p className="text-[11px] text-body">Environment: Production</p>
            <p className="text-[11px] text-body">Account: CH - Main Account</p>
          </div>

          <div className="pt-2 border-t border-border">
            <h4 className="text-sm font-semibold text-heading mb-3">What happens next?</h4>
            <ul className="space-y-3 text-xs text-body">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                Request will be sent to the clearinghouse
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                We will receive and process the response
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                Eligibility results will be displayed
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
                This request will be saved to the patient's history
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ReviewSubmit;