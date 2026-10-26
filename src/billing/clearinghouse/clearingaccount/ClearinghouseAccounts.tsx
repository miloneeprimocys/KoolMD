"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { clearDeletedClearinghouseAccountId, showDeleteClearinghouseAccount } from "@/redux/slices/dialogslice";

/* ---------- Types + static data (replace with API data later) ---------- */
export type AccountStatus = "Connected" | "Disconnected";
export type Environment = "Production" | "Sandbox / Test";

export type ClearinghouseAccount = {
  id: string;
  name: string;
  clearinghouse: string;
  environment: Environment;
  status: AccountStatus;
  syncedDate: string; // "" = never synced
  syncedTime: string;
  createdOn: string;
  createdBy: string;
  clientId: string;
  clientSecret: string;
  payerIds: string;
  logo?: string; // optional logo url, falls back to initials
};

export const CLEARINGHOUSES = ["Availity", "Change Healthcare", "Trizetto", "Office Ally"];

export const ACCOUNTS: ClearinghouseAccount[] = [
  { id: "c1", name: "Availity Production", clearinghouse: "Availity", environment: "Production", status: "Connected", syncedDate: "Oct 20, 2026", syncedTime: "10:25 AM", createdOn: "Sep 05, 2026, 11:12 AM", createdBy: "Dr. Sarah Wilson", clientId: "abc123xyz789", clientSecret: "secret-demo-1234", payerIds: "60054, 62308" },
  { id: "c2", name: "Change Healthcare", clearinghouse: "Change Healthcare", environment: "Production", status: "Connected", syncedDate: "Oct 19, 2026", syncedTime: "06:40 PM", createdOn: "Aug 21, 2026, 09:30 AM", createdBy: "Dr. Sarah Wilson", clientId: "chg456uvw321", clientSecret: "secret-demo-5678", payerIds: "" },
  { id: "c3", name: "Trizetto (EDI)", clearinghouse: "Trizetto", environment: "Production", status: "Disconnected", syncedDate: "", syncedTime: "", createdOn: "Jul 11, 2026, 02:15 PM", createdBy: "System Administrator", clientId: "trz789rst654", clientSecret: "secret-demo-9012", payerIds: "" },
  { id: "c4", name: "Office Ally", clearinghouse: "Office Ally", environment: "Production", status: "Connected", syncedDate: "Oct 18, 2026", syncedTime: "11:12 AM", createdOn: "Jun 02, 2026, 10:05 AM", createdBy: "System Administrator", clientId: "ofa123lmn987", clientSecret: "secret-demo-3456", payerIds: "" },
];

export const ROUTES = {
  list: "/payers/accounts",
  add: "/payers/add-accounts",
  view: (id: string) => `/payers/view-accounts?id=${encodeURIComponent(id)}`,
  edit: (id: string) => `/payers/edit-accounts?id=${encodeURIComponent(id)}`,
};

/* ---------- Columns ---------- */
const COLUMNS: TableColumn[] = [
  { key: "name", label: "Name" },
  { key: "clearinghouse", label: "Clearinghouse" },
  { key: "environment", label: "Environment" },
  { key: "status", label: "Status" },
  { key: "synced", label: "Last Synced" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const ClearinghouseAccounts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deletedAccountId = useAppSelector((state) => state.dialog.deletedClearinghouseAccountId);
  const [accounts, setAccounts] = useState<ClearinghouseAccount[]>(ACCOUNTS);

  useEffect(() => {
    if (!deletedAccountId) return;
    setAccounts((current) => current.filter((account) => account.id !== deletedAccountId));
    dispatch(clearDeletedClearinghouseAccountId());
  }, [deletedAccountId, dispatch]);

  const rows = accounts.map((a) => ({
    name: <Name name={a.name} image={a.logo} />,
    clearinghouse: <Content title={a.clearinghouse} />,
    environment: <Content title={a.environment} />,
    status: <Tags text={a.status} tone={a.status === "Connected" ? "success" : "danger"} />,
    synced: a.syncedDate ? <Content title={a.syncedDate} description={a.syncedTime} /> : <Content title="-" />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit", "delete"]}
          onAction={(action) => {
            if (action === "view") router.push(ROUTES.view(a.id));
            else if (action === "edit") router.push(ROUTES.edit(a.id));
            else if (action === "delete") {
              dispatch(showDeleteClearinghouseAccount(a));
            }
          }}
        />
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Billing", href: "/payment/payment-gateway" },
          { label: "Payers", href: ROUTES.list },
          { label: "Accounts" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Clearinghouse Accounts</h2>
          <p className="mt-0.5 text-sm text-body">Manage clearinghouse connections used for eligibility and claims.</p>
        </div>
        <AddButton
          text="Add Account"
          onClick={() => router.push(ROUTES.add)}
          className="w-fit shrink-0 whitespace-nowrap"
        />
      </div>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        {accounts.length === 0 ? (
          <TableStatus variant="empty" message="No clearinghouse accounts added yet." />
        ) : (
          <Table columns={COLUMNS} rows={rows} bordered={false} />
        )}
      </div>
    </div>
  );
};

export default ClearinghouseAccounts;
