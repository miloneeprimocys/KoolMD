"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, UserCheck, UserX, Users } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import SearchAndFilter from "@/components/Searchandfilter";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import Actions from "@/components/Actions";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  selectPractitionerList,
  selectPractitionerListQuery,
  selectPractitionerStats,
  selectSpecialties,
} from "@/redux/selectors/practitionerSelectors";
import {
  setPractitionerPage,
  setPractitionerSearch,
  setPractitionerSpecialtyFilter,
  setPractitionerStatusFilter,
} from "@/redux/slices/practitionersSlice";
import {
  fetchPractitioners,
  fetchPractitionerStats,
  fetchSpecialties,
} from "@/redux/thunks/practitionerThunks";
import type { Practitioner, PractitionerOnboardingStatus } from "@/types/practitioner";
import { formatCount, humanizeEnum } from "@/utils/formatters";

/* ---------- Filters ---------- */
const SPECIALTY_FILTER_LABEL = "All Specialties";
const STATUS_FILTER_LABEL = "All Statuses";

const ONBOARDING_STATUSES: PractitionerOnboardingStatus[] = [
  "APPROVED",
  "PENDING_REVIEW",
  "DRAFT",
  "REJECTED",
  "SUSPENDED",
];

/** "Active" in the UI = approved for clinical work. */
const ONBOARDING_STATUS_LABELS: Record<PractitionerOnboardingStatus, string> = {
  APPROVED: "Active",
  PENDING_REVIEW: "Pending Approval",
  DRAFT: "Draft",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

const ONBOARDING_STATUS_TONES: Record<PractitionerOnboardingStatus, TagTone> = {
  APPROVED: "success",
  PENDING_REVIEW: "warning",
  DRAFT: "neutral",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

/** Backend search needs at least 2 characters. */
const MIN_SEARCH_LENGTH = 2;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const getPractitionerDisplayName = (practitioner: Practitioner) =>
  `Dr. ${practitioner.firstName} ${practitioner.lastName}`;

/* ---------- Component ---------- */
const Providers = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const listQuery = useAppSelector(selectPractitionerListQuery);
  const practitionerList = useAppSelector(selectPractitionerList);
  const practitionerStats = useAppSelector(selectPractitionerStats);
  const specialties = useAppSelector(selectSpecialties);

  const [searchInput, setSearchInput] = useState(listQuery.search);
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  const [selectedPractitionerIds, setSelectedPractitionerIds] = useState<Set<string>>(new Set());

  /* Typing settles → push the search into the store (too-short terms mean "no search"). */
  useEffect(() => {
    const nextSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : "";
    if (nextSearch !== listQuery.search) dispatch(setPractitionerSearch(nextSearch));
  }, [debouncedSearch, listQuery.search, dispatch]);

  /* `listQuery` keeps its reference until a filter/page actually changes; the thunk also skips
     identical in-flight or fresh requests, so this never fires duplicate calls. */
  useEffect(() => {
    dispatch(fetchPractitioners(listQuery));
  }, [dispatch, listQuery]);

  useEffect(() => {
    dispatch(fetchPractitionerStats());
    dispatch(fetchSpecialties());
  }, [dispatch]);

  const practitioners = practitionerList.items;
  const pagination = practitionerList.pagination;

  /* ---------- Filters ---------- */
  const providerFilters = useMemo(
    () => [
      {
        label: SPECIALTY_FILTER_LABEL,
        options: specialties.map((specialty) => ({ value: specialty.id, label: specialty.name })),
      },
      {
        label: STATUS_FILTER_LABEL,
        options: ONBOARDING_STATUSES.map((status) => ({
          value: status,
          label: ONBOARDING_STATUS_LABELS[status],
        })),
      },
    ],
    [specialties],
  );

  const selectedFilters = useMemo(
    () => ({
      [SPECIALTY_FILTER_LABEL]: listQuery.specialtyId,
      [STATUS_FILTER_LABEL]: listQuery.onboardingStatus,
    }),
    [listQuery.specialtyId, listQuery.onboardingStatus],
  );

  const handleFilterChange = (filterLabel: string, selectedValue: string) => {
    if (filterLabel === SPECIALTY_FILTER_LABEL) {
      dispatch(setPractitionerSpecialtyFilter(selectedValue));
    } else if (filterLabel === STATUS_FILTER_LABEL) {
      dispatch(setPractitionerStatusFilter(selectedValue as PractitionerOnboardingStatus | ""));
    }
  };

  /* ---------- Stats ---------- */
  const stats: StatItem[] = useMemo(() => {
    const statsData = practitionerStats.data;
    const displayCount = (count: number | undefined) =>
      count === undefined ? "—" : formatCount(count);
    return [
      { label: "Total Providers", value: displayCount(statsData?.totalPractitioners), Icon: Users, accent: "primary" },
      { label: "Active Providers", value: displayCount(statsData?.approvedPractitioners), Icon: UserCheck, accent: "success" },
      { label: "Pending Approval", value: displayCount(statsData?.pendingReviewPractitioners), Icon: Clock, accent: "violet" },
      {
        label: "Inactive Providers",
        value: displayCount(statsData?.inactivePractitioners),
        Icon: UserX,
        accent: "danger",
        tag: { text: "Suspended / rejected", tone: "neutral" },
      },
    ];
  }, [practitionerStats.data]);

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPageCount = practitioners.filter((practitioner) =>
    selectedPractitionerIds.has(practitioner.id),
  ).length;
  const allSelected = practitioners.length > 0 && selectedOnPageCount === practitioners.length;
  const someSelected = selectedOnPageCount > 0 && !allSelected;

  const togglePractitionerSelection = (practitionerId: string) => {
    setSelectedPractitionerIds((previous) => {
      const next = new Set(previous);
      if (next.has(practitionerId)) next.delete(practitionerId);
      else next.add(practitionerId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedPractitionerIds(
      allSelected ? new Set() : new Set(practitioners.map((practitioner) => practitioner.id)),
    );
  };

  /* Columns — the select column carries the header checkbox */
  const columns: TableColumn[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(checkboxElement) => {
            if (checkboxElement) checkboxElement.indeterminate = someSelected;
          }}
          onChange={toggleSelectAll}
          aria-label="Select all"
          className={checkboxCls}
        />
      ),
    },
    { key: "provider", label: "Provider" },
    { key: "npi", label: "NPI" },
    { key: "specialty", label: "Specialty" },
    { key: "location", label: "Location" },
    { key: "telemedicine", label: "Telemedicine" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = practitioners.map((practitioner) => {
    const displayName = getPractitionerDisplayName(practitioner);
    const [primaryLocation, ...otherLocations] = practitioner.locations;
    return {
      select: (
        <input
          type="checkbox"
          checked={selectedPractitionerIds.has(practitioner.id)}
          onChange={() => togglePractitionerSelection(practitioner.id)}
          aria-label={`Select ${displayName}`}
          className={checkboxCls}
        />
      ),
      provider: <Name name={displayName} sub={practitioner.credentials ?? practitioner.email} />,
      npi: <Content title={practitioner.npi ?? "—"} />,
      specialty: (
        <Content
          title={practitioner.primarySpecialty?.name ?? practitioner.specialties[0]?.name ?? "—"}
        />
      ),
      location: (
        <Content
          title={primaryLocation?.name ?? "—"}
          description={otherLocations.length ? `+${otherLocations.length} more` : undefined}
        />
      ),
      telemedicine: (
        <Tags
          text={practitioner.offersTelemedicine ? "Available" : "No"}
          tone={practitioner.offersTelemedicine ? "info" : "neutral"}
        />
      ),
      status: (
        <Tags
          text={ONBOARDING_STATUS_LABELS[practitioner.onboardingStatus] ?? humanizeEnum(practitioner.onboardingStatus)}
          tone={ONBOARDING_STATUS_TONES[practitioner.onboardingStatus] ?? "neutral"}
        />
      ),
      actions: (
        <div className="flex w-full items-center justify-center">
          <Actions
            onAction={(action) => {
              if (action === "view") router.push(`/view-provider?id=${practitioner.id}`);
            }}
          />
        </div>
      ),
    };
  });

  /* ---------- Table body state ---------- */
  const isFirstLoad = practitionerList.status === "pending" && practitioners.length === 0;
  const renderTableBody = () => {
    if (practitionerList.status === "failed") {
      return (
        <TableStatus
          variant="error"
          message={practitionerList.error?.message}
          onRetry={() => dispatch(fetchPractitioners(listQuery))}
        />
      );
    }
    if (isFirstLoad || practitionerList.status === "idle") {
      return <TableStatus variant="loading" message="Loading providers…" />;
    }
    if (practitioners.length === 0) {
      return <TableStatus variant="empty" message="No providers match your filters." />;
    }
    return (
      <div className={practitionerList.status === "pending" ? "opacity-60 transition-opacity" : ""}>
        <Table columns={columns} rows={rows} />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Providers" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Providers</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage healthcare providers, practitioners and their profiles.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AddButton text="Add Provider" onClick={() => router.push("/add-provider")} />
        </div>
      </div>

      {/* Stat cards */}
      <StatCards stats={stats} />

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, email or NPI..."
        filters={providerFilters}
        value={listQuery.search}
        onSearch={setSearchInput}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        showDateRange={false}
      />

      {/* Table */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {renderTableBody()}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalItems > 0 && (
          <Pagination
            page={listQuery.page}
            totalPages={Math.max(pagination.totalPages, 1)}
            totalItems={pagination.totalItems}
            pageSize={listQuery.limit}
            onChange={(nextPage) => dispatch(setPractitionerPage(nextPage))}
          />
        )}
      </div>
    </div>
  );
};

export default Providers;
