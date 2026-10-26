"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plug, Power, Trash2 } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import ImportButton from "@/components/ImportButton";
import DeleteButton from "@/components/DeleteButton";
import Name from "@/components/Name";
import Tags from "@/components/Tags";
import TableStatus from "@/components/TableStatus";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { showDeleteClearinghouseAccount } from "@/redux/slices/dialogslice";
import { cardCls } from "@/providers/Shared";
import { ACCOUNTS, ROUTES } from "../ClearinghouseAccounts";
import ClearinghouseOverview from "./Clearinghouseoverview";
import PayerIds from "./Payerids";

/* ---------- Tabs ---------- */
type TabKey = "overview" | "payer-ids";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "payer-ids", label: "Payer IDs" },
];

/* ---------- Page ---------- */
const ViewClearingAccounts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const accountId = params.get("id");
  const initialTab: TabKey = params.get("tab") === "payer-ids" ? "payer-ids" : "overview";

  const deletedAccountId = useAppSelector((state) => state.dialog.deletedClearinghouseAccountId);
  const [tab, setTab] = useState<TabKey>(initialTab);

  const account = ACCOUNTS.find((a) => a.id === accountId) ?? null;

  /* After the delete dialog succeeds, go back to the list (the list removes the account and clears the flag). */
  useEffect(() => {
    if (deletedAccountId && deletedAccountId === accountId) router.push(ROUTES.list);
  }, [deletedAccountId, accountId, router]);

  const breadcrumb = (
    <Breadcrumb
      items={[
        { label: "Billing", href: "/payment/payment-gateway" },
        { label: "Payers", href: ROUTES.list },
        { label: "Accounts", href: ROUTES.list },
        { label: "View Account" },
      ]}
    />
  );

  if (!account) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        {breadcrumb}
        <div className="rounded-[14px] border border-border bg-card">
          <TableStatus
            variant="empty"
            message={accountId ? "This clearinghouse account does not exist." : "No account selected. Open one from the Accounts list."}
          />
          <p className="pb-6 text-center text-sm">
            <Link href={ROUTES.list} className="font-semibold text-link hover:underline">
              Back to Accounts
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const connected = account.status === "Connected";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {breadcrumb}

      <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Clearinghouse Account Details</h2>

      {/* Account summary */}
      <div className={`${cardCls} flex flex-col gap-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between`}>
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <Name name={account.clearinghouse} sub="Clearinghouse" image={account.logo} />
          <Tags text={account.status} tone={connected ? "success" : "danger"} />
          <Tags text={account.environment} tone={account.environment === "Production" ? "success" : "warning"} />
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto sm:gap-3">
          <ImportButton
            text="Edit"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(ROUTES.edit(account.id))}
            className="shrink-0 whitespace-nowrap !border-primary/40 !text-primary"
          />
          <ImportButton
            text="Test Connection"
            icon={<Plug className="h-4 w-4" />}
            onClick={() => {}}
            className="shrink-0 whitespace-nowrap !border-primary/40 !text-primary"
          />
          <ImportButton text="Deactivate" icon={<Power className="h-4 w-4" />} onClick={() => {}} className="shrink-0 whitespace-nowrap" />
          <DeleteButton
            text="Delete"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => dispatch(showDeleteClearinghouseAccount(account))}
            className="!w-auto shrink-0 whitespace-nowrap !rounded-lg !border !border-danger/40 !bg-transparent !font-medium !text-danger hover:!bg-danger/5 focus-visible:!ring-danger/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Account sections" className="flex gap-6 overflow-x-auto border-b border-border hide-scrollbar">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "overview" && <ClearinghouseOverview account={account} />}
        {tab === "payer-ids" && <PayerIds accountId={account.id} />}
      </div>
    </div>
  );
};

export default ViewClearingAccounts;
