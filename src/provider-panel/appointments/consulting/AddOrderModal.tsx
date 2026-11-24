"use client";

import React, { useEffect, useState } from "react";
import { Check, FlaskConical, MoreHorizontal, Network, Pill, ScanLine, Users, type LucideIcon } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { clearConsultationChildModalResult, showModal } from "@/redux/slices/dialogslice";

import ImagingTab, { emptyImaging } from "@/provider-panel/appointments/consulting/ImagingTab";
import LabTestsTab, { emptyLab } from "@/provider-panel/appointments/consulting/LabTestsTab";
import MedicationsTab, { INITIAL_MEDS } from "@/provider-panel/appointments/consulting/MedicationsTab";
import OtherOrdersTab, { INITIAL_OTHER_ORDERS } from "@/provider-panel/appointments/consulting/OtherOrdersTab";
import ProceduresTab, { INITIAL_PROCEDURES } from "@/provider-panel/appointments/consulting/ProceduresTab";
import ReferralsTab, { INITIAL_REFERRALS } from "@/provider-panel/appointments/consulting/ReferralsTab";
import ModalShell, { type Priority } from "@/components/Modalshell";
import type { Medication } from "@/provider-panel/appointments/consulting/MedicationsTab";
import type { OtherOrder } from "@/provider-panel/appointments/consulting/OtherOrdersTab";
import type { Procedure } from "@/provider-panel/appointments/consulting/ProceduresTab";
import type { Referral } from "@/provider-panel/appointments/consulting/ReferralsTab";

export type OrderTabKey = "lab" | "imaging" | "medications" | "referrals" | "procedures" | "other";

export type PlacedOrder = { type: "Lab Test" | "Imaging"; name: string; priority: Priority; instructions: string; date: string };

const ORDER_TABS: { key: OrderTabKey; label: string; title: string; Icon: LucideIcon }[] = [
  { key: "lab", label: "Lab Tests", title: "Add Order", Icon: FlaskConical },
  { key: "imaging", label: "Imaging", title: "Add Imaging Order", Icon: ScanLine },
  { key: "medications", label: "Medications", title: "Medications", Icon: Pill },
  { key: "referrals", label: "Referrals", title: "Referrals", Icon: Users },
  { key: "procedures", label: "Procedures", title: "Procedures", Icon: Network },
  { key: "other", label: "Other Orders", title: "Other Orders", Icon: MoreHorizontal },
];

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: OrderTabKey;
  /** Lab / imaging orders chosen with the footer "Add Order" button. */
  onSubmitOrders?: (orders: PlacedOrder[]) => void;
  /** Called when a medication is added from the Medications tab. */
  onMedicationAdded?: (m: Medication) => void;
};

const AddOrderModal = ({ open, onClose, initialTab = "lab", onSubmitOrders, onMedicationAdded }: Props) => {
  const dispatch = useAppDispatch();
  const childResult = useAppSelector((state) => state.dialog.consultationChildModalResult);
  const childModalOpen = useAppSelector((state) =>
    state.dialog.AddConsultationCustomImaging || state.dialog.AddConsultationMedication ||
    state.dialog.AddConsultationOtherOrder || state.dialog.AddConsultationProcedure ||
    state.dialog.AddConsultationReferral,
  );
  const [tab, setTab] = useState<OrderTabKey>(initialTab);
  const [error, setError] = useState<string | null>(null);

  const [lab, setLab] = useState(emptyLab);
  const [imaging, setImaging] = useState(emptyImaging);
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDS);
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_PROCEDURES);
  const [others, setOthers] = useState<OtherOrder[]>(INITIAL_OTHER_ORDERS);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setError(null);
  }, [open, initialTab]);

  useEffect(() => {
    if (!childResult) return;
    switch (childResult.type) {
      case "imaging":
        setImaging((current) => ({
          ...current,
          custom: [...current.custom, childResult.value],
          selected: [...current.selected, childResult.value.name],
        }));
        break;
      case "medication":
        setMeds((current) => [childResult.value, ...current]);
        onMedicationAdded?.(childResult.value);
        break;
      case "referral":
        setReferrals((current) => [childResult.value, ...current]);
        break;
      case "procedure":
        setProcedures((current) => [childResult.value, ...current]);
        break;
      case "otherOrder":
        setOthers((current) => [childResult.value, ...current]);
        break;
    }
    dispatch(clearConsultationChildModalResult());
  }, [childResult, dispatch, onMedicationAdded]);

  // Escape / overlay click must not close this modal while a nested one is open.
  const handleClose = () => {
    if (childModalOpen) return;
    onClose();
  };

  const current = ORDER_TABS.find((t) => t.key === tab)!;
  const showFooter = tab === "lab" || tab === "imaging";

  const submit = () => {
    if (tab === "lab") {
      if (!lab.selected.length) return setError("Select at least one lab test.");
      onSubmitOrders?.(lab.selected.map((name) => ({ type: "Lab Test", name, priority: lab.priority, instructions: lab.instructions.trim(), date: lab.date })));
      setLab(emptyLab());
    } else {
      if (!imaging.selected.length) return setError("Select at least one imaging study.");
      if (!imaging.reason.trim()) return setError("Clinical indication / reason is required.");
      onSubmitOrders?.(imaging.selected.map((name) => ({ type: "Imaging", name, priority: imaging.priority, instructions: imaging.instructions.trim() || imaging.reason.trim(), date: imaging.date })));
      setImaging((p) => ({ ...emptyImaging(), custom: p.custom }));
    }
    setError(null);
    onClose();
  };

  const content = {
    lab: <LabTestsTab value={lab} onChange={(v) => { setLab(v); setError(null); }} />,
    imaging: <ImagingTab value={imaging} onChange={(v) => { setImaging(v); setError(null); }} onAddCustom={() => dispatch(showModal("AddConsultationCustomImaging"))} />,
    medications: (
      <MedicationsTab
        meds={meds}
        onAdd={() => dispatch(showModal("AddConsultationMedication"))}
        onDiscontinue={(id) => setMeds((p) => p.map((m) => (m.id === id ? { ...m, status: "Completed" } : m)))}
        // onEdit={(m) => ...}  TODO: open AddMedicationModal prefilled
      />
    ),
    referrals: (
      <ReferralsTab
        referrals={referrals}
        onCreate={() => dispatch(showModal("AddConsultationReferral"))}
        onChange={(id, patch) => setReferrals((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)))}
      />
    ),
    procedures: <ProceduresTab procedures={procedures} onAdd={() => dispatch(showModal("AddConsultationProcedure"))} onDelete={(id) => setProcedures((p) => p.filter((x) => x.id !== id))} />,
    other: <OtherOrdersTab orders={others} onAdd={() => dispatch(showModal("AddConsultationOtherOrder"))} onDelete={(id) => setOthers((p) => p.filter((x) => x.id !== id))} />,
  }[tab];

  return (
    <>
      <ModalShell
        open={open}
        onClose={handleClose}
        title={current.title}
        titleId="add-order-title"
        width={1160}
        errorMessage={error}
        footer={
          showFooter ? (
            <div className="flex items-center justify-center gap-3 sm:justify-end">
              <ImportButton text="Cancel" icon={null} onClick={handleClose} />
              <AddButton text="Add Order" icon={<Check className="h-4 w-4" />} onClick={submit} className="whitespace-nowrap" />
            </div>
          ) : undefined
        }
      >
        <div className="grid gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
          <nav aria-label="Order types" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {ORDER_TABS.map(({ key, label, Icon }) => {
              const active = key === tab;
              return (
                <button
                  key={key}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => { setTab(key); setError(null); }}
                  className={`flex shrink-0 cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    active ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 md:h-[min(62vh,560px)]">{content}</div>
        </div>
      </ModalShell>

    </>
  );
};

export default AddOrderModal;
