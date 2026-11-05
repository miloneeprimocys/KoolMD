"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Lock, XCircle } from "lucide-react";

import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import SignupDropdown from "@/components/SignupDropdown";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Pagination from "@/components/Pagination";
import { cardCls } from "@/providers/Shared";
import { MODULES, ROLE_PERMISSIONS } from "./Permissionmatrix";
import { useAppDispatch } from "@/hooks/useAppHooks";
import { showAccessRequest } from "@/redux/slices/dialogslice";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "receptionist", label: "Receptionist" },
  { value: "practitioner", label: "Practitioner / MD" },
  { value: "staff", label: "Staff" },
  { value: "patient", label: "Patient" },
];

type AuditRow = { id: string; date: string; time: string; admin: string; action: string; module: string };

const AUDIT: AuditRow[] = [
  { id: "1", date: "Oct 31, 2026", time: "10:24 AM", admin: "Admin", action: "Updated permissions", module: "Appointments" },
  { id: "2", date: "Oct 30, 2026", time: "04:17 PM", admin: "Admin", action: "Added role", module: "Clinical Assistant" },
  { id: "3", date: "Oct 28, 2026", time: "11:02 AM", admin: "Admin", action: "Assigned role to user", module: "Dr. Anita Brown" },
  { id: "4", date: "Oct 27, 2026", time: "05:48 PM", admin: "Admin", action: "Updated access scope", module: "Reports" },
  { id: "5", date: "Oct 26, 2026", time: "09:12 AM", admin: "Admin", action: "Updated permissions", module: "Billing & Invoice" },
  { id: "6", date: "Oct 24, 2026", time: "02:35 PM", admin: "Admin", action: "Removed role from user", module: "Peter Parker" },
  { id: "7", date: "Oct 22, 2026", time: "12:48 PM", admin: "Admin", action: "Added role", module: "Receptionist" },
  { id: "8", date: "Oct 20, 2026", time: "03:20 PM", admin: "Admin", action: "Updated permissions", module: "Documents" },
];

const ACTION_TONES: Record<string, "success" | "info" | "warning" | "danger"> = {
  "Added role": "success",
  "Updated permissions": "info",
  "Updated access scope": "info",
  "Assigned role to user": "warning",
  "Removed role from user": "danger",
};

const ACTION_FILTER = "All Actions";
const PAGE_SIZE = 5;

const AUDIT_COLUMNS: TableColumn[] = [
  { key: "when", label: "Date & Time" },
  { key: "admin", label: "Admin" },
  { key: "action", label: "Action" },
  { key: "module", label: "Module" },
];

const buildRows = (items: AuditRow[]) =>
  items.map((a) => ({
    when: <Content title={a.date} description={a.time} />,
    admin: <Content title={a.admin} />,
    action: <Tags text={a.action} tone={ACTION_TONES[a.action] ?? "neutral"} size="xs" />,
    module: <Content title={a.module} />,
  }));

type SubTab = "preview" | "audit";

/* ---------------------------------------------------------------- */
/*  Tab component                                                    */
/* ---------------------------------------------------------------- */
const AccessControl = () => {
  const dispatch = useAppDispatch();
  const [subTab, setSubTab] = useState<SubTab>("preview");
  const [roleId, setRoleId] = useState("practitioner");

  // Audit log table state
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === roleId)?.label ?? "";
  const permissions = ROLE_PERMISSIONS[roleId];
  const accessible = MODULES.filter((m) => permissions[m.key].view);
  const restricted = MODULES.filter((m) => !permissions[m.key].view);

  const filteredAudit = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AUDIT.filter((a) => {
      if (q && ![a.action, a.module, a.admin].some((f) => f.toLowerCase().includes(q))) return false;
      if (actionFilter && a.action !== actionFilter) return false;
      return true;
    });
  }, [search, actionFilter]);

  const totalPages = Math.max(Math.ceil(filteredAudit.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visibleAudit = filteredAudit.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h3 className="text-base font-semibold text-heading sm:text-lg 2xl:text-xl">Access Control – Preview & Audit</h3>
        <p className="mt-0.5 text-sm text-body">
          Preview role-based navigation, check accessible and restricted modules, and review recent permission changes.
        </p>
      </div>

      <div role="tablist" aria-label="Access control sections" className="hide-scrollbar flex gap-4 overflow-x-auto border-b border-border sm:gap-6">
        {([
          ["preview", "Role Access Preview"],
          ["audit", "Access Audit Log"],
        ] as [SubTab, string][]).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={subTab === key}
            onClick={() => setSubTab(key)}
            className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:pb-3 sm:text-sm ${
              subTab === key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === "preview" ? (
        <div className="space-y-4 sm:space-y-5">
          <div className="max-w-xs">
            <SignupDropdown
              name="previewRole"
              label="Preview as role"
              placeholder="Select role"
              options={ROLE_OPTIONS}
              value={roleId}
              onChange={setRoleId}
              searchable={false}
            />
          </div>

          <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
            {/* Navigation preview */}
            <section className={`${cardCls} sm:p-6`}>
              <h4 className="text-sm font-semibold text-heading">{roleLabel} – Navigation Preview</h4>
              <p className="mt-0.5 text-xs text-body">This is how the application navigation will appear for users with this role.</p>
              <div className="mt-4 space-y-1 rounded-xl bg-[#eef5ff] p-3 dark:bg-[#0c1a5a]">
                <p className="px-2 pb-2 text-sm font-extrabold text-[#0c1a4e] dark:text-white">KOOLMD</p>
                {accessible.map(({ key, label, Icon }, i) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-primary text-white" : "text-[#33466f] dark:text-slate-200"}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </div>
                ))}
                {accessible.length === 0 && <p className="px-2 py-3 text-xs text-[#33466f] dark:text-slate-200">No accessible modules.</p>}
              </div>
            </section>

            {/* Accessible / restricted */}
            <section className={`${cardCls} space-y-5 sm:p-6`}>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-heading">Accessible Modules</h4>
                <ul className="space-y-2">
                  {accessible.map(({ key, label }) => (
                    <li key={key} className="flex items-center gap-2 text-sm text-heading">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-heading">Restricted Modules</h4>
                {restricted.length === 0 ? (
                  <p className="text-sm text-body">None – this role can open every module.</p>
                ) : (
                  <ul className="space-y-2">
                    {restricted.map(({ key, label }) => (
                      <li key={key} className="flex items-center gap-2 text-sm text-heading">
                        <XCircle className="h-4 w-4 shrink-0 text-danger" />
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Recent changes + denied example */}
            <div className="space-y-4 sm:space-y-5">
              <section className={`${cardCls} space-y-3 sm:p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-heading">Recent Permission Changes</h4>
                  <button
                    type="button"
                    onClick={() => setSubTab("audit")}
                    className="cursor-pointer text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:text-sm"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-hidden rounded-[14px] border border-border bg-card">
                  <Table columns={AUDIT_COLUMNS} rows={buildRows(AUDIT.slice(0, 4))} bordered={false} />
                </div>
              </section>

              {restricted.length > 0 && (
                <section className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 dark:bg-danger/20 p-4 sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                    <Lock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-danger">Access Restricted Example</p>
                    <p className="mt-0.5 text-xs text-body">You don&apos;t have permission to access {restricted[0].label}.</p>
                    <ImportButton
                      text="Request Access"
                      icon={null}
                      className="mt-3"
                      onClick={() => dispatch(showAccessRequest(restricted[0].label))}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <SearchAndFilter
            placeholder="Search by action, module or admin..."
            value={search}
            onSearch={(v: string) => {
              setSearch(v);
              setPage(1);
            }}
            filters={[{ label: ACTION_FILTER, options: Object.keys(ACTION_TONES) }]}
            selectedFilters={{ [ACTION_FILTER]: actionFilter }}
            onFilterChange={(_label: string, value: string) => {
              setActionFilter(value);
              setPage(1);
            }}
            showDateRange={false}
          />
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[14px] border border-border bg-card">
              {visibleAudit.length === 0 ? (
                <TableStatus variant="empty" message="No audit entries match your filters." />
              ) : (
                <Table columns={AUDIT_COLUMNS} rows={buildRows(visibleAudit)} bordered={false} />
              )}
            </div>
            {filteredAudit.length > 0 && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                totalItems={filteredAudit.length}
                pageSize={PAGE_SIZE}
                itemLabel="entries"
                onChange={setPage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
