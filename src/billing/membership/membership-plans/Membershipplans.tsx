"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter, { type FilterOption } from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  selectMembershipPlanForEdit,
  showMembershipPlanDelete,
  showMembershipPlanView,
} from "@/redux/slices/dialogslice";
import {
  PlanIcon,
  formatPrice,
  type MembershipPlan,
  type PlanType,
} from "./Viewmembershipplan";

const CREATE_ROUTE = "/membership/plans/create";

/* ---------- Plan type chip ---------- */
const TYPE_CLS: Record<PlanType, string> = {
  Individual: "bg-primary/15 text-primary",
  Family: "bg-success/15 text-success",
  Corporate: "bg-violet/15 text-violet",
};

export const PlanTypeChip = ({ type }: { type: PlanType }) => (
  <span className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-medium ${TYPE_CLS[type]}`}>
    {type}
  </span>
);


/* ---------- Static data (replace with API data later) ---------- */
export const PLANS: MembershipPlan[] = [
  {
    id: "p1",
    name: "Premium Care Plan",
    description: "Comprehensive care with discounted consultation fees and exclusive benefits.",
    type: "Individual",
    price: 49,
    cycle: "Monthly",
    status: "Active",
    members: 124,
    icon: "crown",
    startDate: "2024-01-01",
    benefits: [
      "30% discount on appointment payments",
      "Priority appointment booking",
      "Access to exclusive member events",
      "Waived consultation fee for follow-up visits",
      "Dedicated care support",
    ],
  },
  {
    id: "p2",
    name: "Annual Wellness",
    description: "Year-long membership with full access to wellness programs and priority care.",
    type: "Individual",
    price: 499,
    cycle: "Annual",
    status: "Active",
    members: 86,
    icon: "gem",
    startDate: "2024-02-15",
    benefits: ["Annual health screening", "Full access to wellness programs", "Priority care scheduling"],
  },
  {
    id: "p3",
    name: "Family Care Plan",
    description: "Coverage for the whole family with shared benefits.",
    type: "Family",
    price: 79,
    cycle: "Monthly",
    status: "Active",
    members: 42,
    icon: "users",
    startDate: "2024-03-10",
    benefits: ["Coverage for up to 5 family members", "Shared benefits across members", "Family health check-ups"],
  },
  {
    id: "p4",
    name: "Chronic Care Plan",
    description: "Ongoing support for chronic condition management.",
    type: "Individual",
    price: 69,
    cycle: "Monthly",
    status: "Active",
    members: 68,
    icon: "heart",
    startDate: "2024-04-05",
    benefits: ["Ongoing condition monitoring", "Medication management support", "Quarterly specialist reviews"],
  },
  {
    id: "p5",
    name: "Preventive Care Plan",
    description: "Focus on preventive care and regular health check-ups.",
    type: "Individual",
    price: 39,
    cycle: "Monthly",
    status: "Inactive",
    members: 0,
    icon: "leaf",
    startDate: "2024-06-01",
    benefits: ["Regular health check-ups", "Vaccination reminders", "Preventive screening discounts"],
  },
];


/* ---------- Filters ---------- */
const ALL = "";
const TYPE_OPTIONS: FilterOption[] = ["Individual", "Family", "Corporate"];
const STATUS_OPTIONS: FilterOption[] = ["Active", "Inactive"];

const PAGE_SIZE = 10;

/* ---------- Columns ---------- */
const COLUMNS: TableColumn[] = [
  { key: "plan", label: "Plan Name" },
  { key: "type", label: "Type" },
  { key: "price", label: "Price" },
  { key: "cycle", label: "Billing Cycle" },
  { key: "status", label: "Status" },
  { key: "members", label: "Members" },
  {
    key: "actions",
    label: "Actions",
    header: <div className="flex w-full items-center justify-center">Actions</div>,
  },
];

/* ---------- Component ---------- */
const MembershipPlans = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deletedPlanIds = useAppSelector((state) => state.dialog.deletedMembershipPlanIds);

  const [search, setSearch] = useState("");
  const [type, setType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const resetFilters = () => {
    setSearch("");
    setType(ALL);
    setStatus(ALL);
    setPage(1);
  };

  const handleFilterChange = (filterLabel: string, option: string) => {
    if (filterLabel === "Plan Type") setType(option);
    else if (filterLabel === "Status") setStatus(option);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PLANS.filter((plan) => !deletedPlanIds.includes(plan.id)).filter((plan) => {
      if (q && !`${plan.name} ${plan.description}`.toLowerCase().includes(q)) return false;
      if (type !== ALL && plan.type !== type) return false;
      if (status !== ALL && plan.status !== status) return false;
      return true;
    });
  }, [deletedPlanIds, search, type, status]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openView = (plan: MembershipPlan) => {
    dispatch(showMembershipPlanView(plan));
  };

  const rows = visible.map((plan) => ({
    plan: (
      <div className="flex min-w-0 items-center gap-3">
        <PlanIcon icon={plan.icon} />
        <Content title={plan.name} description={plan.description} truncate />
      </div>
    ),
    type: <PlanTypeChip type={plan.type} />,
    price: <Content title={formatPrice(plan.price)} />,
    cycle: <Content title={plan.cycle} />,
    status: <Tags text={plan.status} tone={plan.status === "Active" ? "success" : "neutral"} />,
    members: <Content title={String(plan.members)} />,
    actions: (
      <div className="flex w-full items-center justify-center">
        <Actions
          actions={["view", "edit", "delete"]}
          onAction={(action) => {
            if (action === "view") openView(plan);
            else if (action === "delete") dispatch(showMembershipPlanDelete(plan));
            else {
              dispatch(selectMembershipPlanForEdit(plan));
              router.push(`/membership/plans/edit?id=${encodeURIComponent(plan.id)}`);
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
          { label: "Billing & Payments", href: "/payment/payment-gateway" },
          { label: "Membership Plans" },
        ]}
      />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Membership Plans</h2>
          <p className="mt-0.5 text-sm text-body">Create and manage membership plans for patients.</p>
        </div>
        <AddButton
          text="Create Membership Plan"
         
          onClick={() => router.push(CREATE_ROUTE)}
          className="w-fit shrink-0 whitespace-nowrap"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1">
          <SearchAndFilter
            placeholder="Search plans..."
            value={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            filters={[
              { label: "Plan Type", options: TYPE_OPTIONS },
              { label: "Status", options: STATUS_OPTIONS },
            ]}
            selectedFilters={{ "Plan Type": type, Status: status }}
            onFilterChange={handleFilterChange}
            showDateRange={false}
            className="flex-col xl:flex-row 2xl:flex-row"
          />
        </div>
        <ImportButton text="Reset" icon={null} onClick={resetFilters} className="flex-none" />
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {visible.length === 0 ? (
            <TableStatus variant="empty" message="No plans match your filters." />
          ) : (
            <Table columns={COLUMNS} rows={rows} bordered={false} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="plans"
            onChange={setPage}
          />
        )}
      </div>

    </div>
  );
};

export default MembershipPlans;
