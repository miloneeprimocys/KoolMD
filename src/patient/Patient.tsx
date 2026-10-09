"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, UserCheck, UserPlus, Users } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
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
  selectPatientList,
  selectPatientListQuery,
  selectPatientStats,
} from "@/redux/selectors/patientSelectors";
import {
  setPatientGenderFilter,
  setPatientPage,
  setPatientSearch,
  setPatientStatusFilter,
} from "@/redux/slices/patientsSlice";
import { fetchPatients, fetchPatientStats } from "@/redux/thunks/patientThunks";
import type { AdministrativeGender, PatientStatus, PatientSummary } from "@/types/patient";
import { calculateAgeInYears, formatCount, formatDateOnly, humanizeEnum } from "@/utils/formatters";

/* ---------- Filters ---------- */
const STATUS_FILTER_LABEL = "Status";
const GENDER_FILTER_LABEL = "Gender";

const PATIENT_STATUSES: PatientStatus[] = ["ACTIVE", "INACTIVE", "DECEASED"];
const ADMINISTRATIVE_GENDERS: AdministrativeGender[] = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];

const PATIENT_FILTERS = [
  {
    label: STATUS_FILTER_LABEL,
    options: PATIENT_STATUSES.map((status) => ({ value: status, label: humanizeEnum(status) })),
  },
  {
    label: GENDER_FILTER_LABEL,
    options: ADMINISTRATIVE_GENDERS.map((gender) => ({ value: gender, label: humanizeEnum(gender) })),
  },
];

const STATUS_TONES: Record<PatientStatus, TagTone> = {
  ACTIVE: "success",
  INACTIVE: "danger",
  DECEASED: "neutral",
};

/** Backend search needs at least 2 characters. */
const MIN_SEARCH_LENGTH = 2;

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const getPatientFullName = (patient: PatientSummary) =>
  [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ");

/* ---------- Component ---------- */
const Patient = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const listQuery = useAppSelector(selectPatientListQuery);
  const patientList = useAppSelector(selectPatientList);
  const patientStats = useAppSelector(selectPatientStats);

  const [searchInput, setSearchInput] = useState(listQuery.search);
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());

  /* Typing settles → push the search into the store (too-short terms mean "no search"). */
  useEffect(() => {
    const nextSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : "";
    if (nextSearch !== listQuery.search) dispatch(setPatientSearch(nextSearch));
  }, [debouncedSearch, listQuery.search, dispatch]);

  /* `listQuery` keeps its reference until a filter/page actually changes; the thunk also skips
     identical in-flight or fresh requests, so this never fires duplicate calls. */
  useEffect(() => {
    dispatch(fetchPatients(listQuery));
  }, [dispatch, listQuery]);

  useEffect(() => {
    dispatch(fetchPatientStats());
  }, [dispatch]);

  const patients = patientList.items;
  const pagination = patientList.pagination;

  const handleFilterChange = (filterLabel: string, selectedValue: string) => {
    if (filterLabel === STATUS_FILTER_LABEL) {
      dispatch(setPatientStatusFilter(selectedValue as PatientStatus | ""));
    } else if (filterLabel === GENDER_FILTER_LABEL) {
      dispatch(setPatientGenderFilter(selectedValue as AdministrativeGender | ""));
    }
  };

  const selectedFilters = useMemo(
    () => ({
      [STATUS_FILTER_LABEL]: listQuery.status,
      [GENDER_FILTER_LABEL]: listQuery.administrativeGender,
    }),
    [listQuery.status, listQuery.administrativeGender],
  );

  /* ---------- Stats ---------- */
  const stats: StatItem[] = useMemo(() => {
    const statsData = patientStats.data;
    const displayCount = (count: number | undefined) =>
      count === undefined ? "—" : formatCount(count);
    return [
      { label: "Total Patients", value: displayCount(statsData?.totalPatients), Icon: Users, accent: "primary" },
      { label: "Active Patients", value: displayCount(statsData?.activePatients), Icon: UserCheck, accent: "success" },
      {
        label: "New Patients",
        value: displayCount(statsData?.newPatientsLast30Days),
        Icon: UserPlus,
        accent: "violet",
        tag: { text: "Last 30 days", tone: "neutral" },
      },
      {
        label: "Inactive Patients",
        value: displayCount(statsData?.inactivePatients),
        Icon: Ban,
        accent: "danger",
      },
    ];
  }, [patientStats.data]);

  /* ---------- Selection (current page only) ---------- */
  const selectedOnPageCount = patients.filter((patient) => selectedPatientIds.has(patient.id)).length;
  const allSelected = patients.length > 0 && selectedOnPageCount === patients.length;
  const someSelected = selectedOnPageCount > 0 && !allSelected;

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatientIds((previous) => {
      const next = new Set(previous);
      if (next.has(patientId)) next.delete(patientId);
      else next.add(patientId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedPatientIds(allSelected ? new Set() : new Set(patients.map((patient) => patient.id)));
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
    { key: "patient", label: "Patient" },
    { key: "patientId", label: "Patient ID" },
    { key: "dob", label: "Date of Birth" },
    { key: "gender", label: "Gender" },
    { key: "contact", label: "Contact" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      header: <div className="flex w-full items-center justify-center">Actions</div>,
    },
  ];

  const rows = patients.map((patient) => {
    const fullName = getPatientFullName(patient);
    const genderLabel = humanizeEnum(patient.administrativeGender);
    return {
      select: (
        <input
          type="checkbox"
          checked={selectedPatientIds.has(patient.id)}
          onChange={() => togglePatientSelection(patient.id)}
          aria-label={`Select ${fullName}`}
          className={checkboxCls}
        />
      ),
      patient: (
        <Name
          name={fullName}
          sub={`${calculateAgeInYears(patient.dateOfBirth)} years • ${genderLabel}`}
        />
      ),
      patientId: <Content title={patient.medicalRecordNumber} />,
      dob: <Content title={formatDateOnly(patient.dateOfBirth)} />,
      gender: <Content title={genderLabel} />,
      contact: (
        <Content title={patient.phoneNumber ?? "—"} description={patient.email ?? undefined} />
      ),
      status: <Tags text={humanizeEnum(patient.status)} tone={STATUS_TONES[patient.status]} />,
      actions: (
        <div className="flex w-full items-center justify-center">
          {/* View / edit screens are not built yet */}
          <Actions onAction={() => undefined} />
        </div>
      ),
    };
  });

  /* ---------- Table body state ---------- */
  const isFirstLoad = patientList.status === "pending" && patients.length === 0;
  const renderTableBody = () => {
    if (patientList.status === "failed") {
      return (
        <TableStatus
          variant="error"
          message={patientList.error?.message}
          onRetry={() => dispatch(fetchPatients(listQuery))}
        />
      );
    }
    if (isFirstLoad || patientList.status === "idle") {
      return <TableStatus variant="loading" message="Loading patients…" />;
    }
    if (patients.length === 0) {
      return <TableStatus variant="empty" message="No patients match your filters." />;
    }
    return (
      <div className={patientList.status === "pending" ? "opacity-60 transition-opacity" : ""}>
        <Table columns={columns} rows={rows} />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patients" }]} />

      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-heading sm:text-lg 2xl:text-2xl">Patients</h2>
          <p className="mt-0.5 text-sm text-body">Manage patient records, registration and profiles.</p>
        </div>

        {/* Buttons — side by side on phones, no wrapping */}
        <div className="flex flex-row gap-2">
          <ImportButton className="shrink-0 whitespace-nowrap" />
          <AddButton
            text="Add Patient"
            onClick={() => router.push("/add-patient")}
            className="shrink-0 whitespace-nowrap"
          />
        </div>
      </div>

      {/* Search + filters */}
      <SearchAndFilter
        placeholder="Search by name, email, phone or patient ID..."
        filters={PATIENT_FILTERS}
        value={listQuery.search}
        onSearch={setSearchInput}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        showDateRange={false}
      />

      {/* Stat cards */}
      <StatCards stats={stats} />

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
            onChange={(nextPage) => dispatch(setPatientPage(nextPage))}
          />
        )}
      </div>
    </div>
  );
};

export default Patient;
