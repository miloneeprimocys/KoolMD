"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import AddButton from "@/components/Addbutton";
import Breadcrumb from "@/components/Breadcrumb";
import SuccessToast from "@/components/SuccessToast";
import ErrorToast from "@/components/ErrorToast";
import BlockTime, { type Notify } from "./Blocktime";
import AddExtraAvailability from "./Addextraavailability";
import Holidays from "./Holidays";
import AddHolidays from "./Addholidays";
const BACK_ROUTE = "/appointments?tab=calendar";

type TabKey = "block" | "extra" | "holidays";

const TABS: { key: TabKey; label: string }[] = [
  { key: "block", label: "Block Time" },
  { key: "extra", label: "Add Extra Availability" },
  { key: "holidays", label: "Holidays" },
];
type ToastState = { type: "success" | "error" | null; title: string; message: string };

const BlockTimeMain = () => {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("block");

  const [toast, setToast] = useState<ToastState>({ type: null, title: "", message: "" });

  const notify: Notify = (type, title, message) => setToast({ type, title, message });
  const close = () => setToast((prev) => ({ ...prev, type: null }));
  const done = () => router.push(BACK_ROUTE);

  const [holidaysView, setHolidaysView] = useState<"list" | "form">("list");
  const [editingHoliday, setEditingHoliday] = useState<any>(undefined);

  const handleAddHoliday = () => {
    setEditingHoliday(undefined);
    setHolidaysView("form");
  };

  const handleEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setHolidaysView("form");
  };

  const handleDeleteHoliday = (id: string) => {
    // Holiday deletion is handled within the Holidays component
  };

  const handleHolidayCancel = () => {
    setHolidaysView("list");
    setEditingHoliday(undefined);
  };

  const handleHolidaySave = (rows: any) => {
    setHolidaysView("list");
    setEditingHoliday(undefined);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
        <SuccessToast isOpen={toast.type === "success"} onClose={close} title={toast.title} message={toast.message} />
        <ErrorToast isOpen={toast.type === "error"} onClose={close} title={toast.title} message={toast.message} />

      <Breadcrumb
          items={[
            { label: "Appointments", href: BACK_ROUTE },
            { label: tab === "block" ? "Block Time" : "Add Extra Availability" },
            { label: TABS.find((t) => t.key === tab)?.label ?? "Block Time" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-heading sm:text-xl 2xl:text-2xl">Block Time / Add Availability</h2>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              Block a provider&apos;s time or add extra availability outside the regular working hours.
            </p>
          </div>
          {tab === "holidays" && (
            <AddButton
              text="Add Holiday"
              onClick={handleAddHoliday}
              className="shrink-0 whitespace-nowrap px-3 text-xs sm:px-5 sm:text-sm"
            />
          )}
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Block time sections" className="flex gap-4 overflow-x-auto border-b border-border hide-scrollbar sm:gap-6">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
                  active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="flex-1 mt-4">
        {tab === "block" && <div className="mx-auto mt-4 w-full max-w-[1600px] sm:mt-5"><BlockTime notify={notify} onDone={done} /></div>}
        {tab === "extra" && <AddExtraAvailability notify={notify} onDone={done} />}
        {tab === "holidays" && (
          holidaysView === "form" ? (
            <div className="mx-auto mt-4 w-full max-w-[1600px] sm:mt-5">
              <AddHolidays notify={notify} onCancel={handleHolidayCancel} onSave={handleHolidaySave} initial={editingHoliday} />
            </div>
          ) : (
            <Holidays notify={notify} onEditHoliday={handleEditHoliday} onDeleteHoliday={handleDeleteHoliday} />
          )
        )}
      </div>
    </div>
  );
};

export default BlockTimeMain;