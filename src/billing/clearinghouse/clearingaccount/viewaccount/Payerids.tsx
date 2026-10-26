"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Landmark, Plus } from "lucide-react";

import AddButton from "@/components/Addbutton";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { TableSelectAllCheckbox, useTableSelection } from "@/components/TableSelection";
import { cardCls } from "@/providers/Shared";
import { ROUTES } from "../ClearinghouseAccounts";
import DeletePayerId from "./Deletepayerid";

/* ---------- Types + static data (replace with API data later) ---------- */
export type PayerId = {
  id: string;
  name: string;
  payerId: string;
  type: "Commercial" | "Government";
  eligibility: boolean;
  claims: boolean;
  claimStatus: boolean;
  status: "Active" | "Inactive";
  addedDate: string;
  addedTime: string;
  isDefault: boolean;
  effectiveDate: string; // ISO yyyy-mm-dd or ""
  notes: string;
};

const p = (
  id: string,
  name: string,
  payerId: string,
  type: PayerId["type"],
  eligibility: boolean,
  claims: boolean,
  status: PayerId["status"],
  addedDate: string,
  addedTime: string,
  notes = "",
): PayerId => ({
  id, name, payerId, type, eligibility, claims, claimStatus: true, status, addedDate, addedTime,
  isDefault: false, effectiveDate: "", notes,
});

export const PAYER_IDS: PayerId[] = [
  p("p1", "Aetna", "60054", "Commercial", true, true, "Active", "Oct 10, 2026", "10:15 AM", "Used for commercial patients under Aetna."),
  p("p2", "Blue Cross Blue Shield", "00301", "Commercial", true, true, "Active", "Oct 08, 2026", "02:40 PM"),
  p("p3", "Cigna", "62308", "Commercial", true, false, "Active", "Oct 05, 2026", "11:22 AM"),
  p("p4", "UnitedHealthcare", "87726", "Commercial", true, true, "Active", "Oct 01, 2026", "09:18 AM"),
  p("p5", "Medicare", "11101", "Government", true, true, "Active", "Sep 28, 2026", "03:15 PM"),
  p("p6", "Medicaid - Texas", "87703", "Government", true, false, "Inactive", "Sep 25, 2026", "01:10 PM"),
  p("p7", "Tricare", "87724", "Government", true, true, "Active", "Sep 20, 2026", "05:32 PM"),
  p("p8", "Humana", "61101", "Commercial", true, true, "Active", "Sep 15, 2026", "11:05 AM"),
  p("p9", "WellCare", "88726", "Commercial", false, true, "Active", "Sep 12, 2026", "10:45 AM"),
  p("p10", "Ambetter", "68069", "Commercial", true, true, "Active", "Sep 10, 2026", "04:20 PM"),
];

export const getPayerId = (id: string) => PAYER_IDS.find((x) => x.id === id);

const TOTAL = 24;
const PAGE_SIZE = 10;

/** Routes for the payer-ID screens. The edit screen also serves "add" (no `id`). */
export const PAYER_ROUTES = {
  view: (accountId: string) => `${ROUTES.view(accountId)}&tab=payer-ids`,
  add: (accountId: string) =>
    `/payers/edit-payer-ids?accountId=${encodeURIComponent(accountId)}`,
  edit: (accountId: string, id: string) =>
    `/payers/edit-payer-ids?accountId=${encodeURIComponent(accountId)}&id=${encodeURIComponent(id)}`,
};

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const COLUMNS: TableColumn[] = [
  { key: "select", label: "", className: "w-10", header: null },
  { key: "no", label: "#", className: "w-10" },
  { key: "name", label: "Payer Name" },
  { key: "payerId", label: "Payer ID" },
  { key: "type", label: "Payer Type" },
  { key: "eligibility", label: "Eligibility" },
  { key: "claims", label: "Claims" },
  { key: "status", label: "Status" },
  { key: "added", label: "Added On" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const PayerIds = ({ accountId }: { accountId: string }) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [payers, setPayers] = useState<PayerId[]>(PAYER_IDS);
  const [deleting, setDeleting] = useState<PayerId | null>(null);

  const { selectedKeys, allSelected, someSelected, toggleRow, toggleAll } = useTableSelection(payers.map((x) => x.id));

  const totalItems = TOTAL - (PAYER_IDS.length - payers.length);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const columns = COLUMNS.map((c) =>
    c.key === "select"
      ? {
          ...c,
          header: (
            <TableSelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              className={checkboxCls}
            />
          ),
        }
      : c,
  );

  const rows = payers.map((x, i) => {
    const TypeIcon = x.type === "Government" ? Landmark : Building2;
    return {
      select: (
        <RadioCheckButtonh
          type="checkbox"
          checked={selectedKeys.has(x.id)}
          onChange={() => toggleRow(x.id)}
          aria-label={`Select ${x.name}`}
          className={checkboxCls}
        />
      ),
      no: <span className="text-sm text-body">{(page - 1) * PAGE_SIZE + i + 1}</span>,
      name: <Content title={x.name} truncate />,
      payerId: <Content title={x.payerId} />,
      type: (
        <div className="flex items-center gap-2">
          <TypeIcon className={`h-4 w-4 shrink-0 ${x.type === "Government" ? "text-violet" : "text-body"}`} />
          <Content title={x.type} />
        </div>
      ),
      eligibility: <Tags text={x.eligibility ? "Yes" : "No"} tone={x.eligibility ? "success" : "danger"} />,
      claims: <Tags text={x.claims ? "Yes" : "No"} tone={x.claims ? "success" : "danger"} />,
      status: <Tags text={x.status} tone={x.status === "Active" ? "success" : "danger"} />,
      added: <Content title={x.addedDate} description={x.addedTime} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            actions={["edit", "delete"]}
            onAction={(action) => {
              if (action === "edit") router.push(PAYER_ROUTES.edit(accountId, x.id));
              else if (action === "delete") setDeleting(x);
            }}
          />
        </div>
      ),
    };
  });

  return (
    <>
      <section className={`${cardCls} space-y-4 sm:p-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-heading sm:text-lg">Payer IDs</h3>
            <p className="mt-0.5 text-xs text-body sm:text-sm">
              Manage payer IDs configured for this clearinghouse account. These IDs are used for eligibility
              verification and claim submission.
            </p>
          </div>
          <AddButton
            text="Add Payer ID"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push(PAYER_ROUTES.add(accountId))}
            className="w-fit shrink-0 whitespace-nowrap"
          />
        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
          <Table columns={columns} rows={rows} bordered={false} />
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          itemLabel="payer IDs"
          onChange={setPage}
        />
      </section>

      <DeletePayerId
        open={!!deleting}
        payer={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(id) => setPayers((current) => current.filter((x) => x.id !== id))}
      />
    </>
  );
};

export default PayerIds;
