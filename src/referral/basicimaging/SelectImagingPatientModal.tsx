"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import ModalShell from "@/components/Modalshell";
import Pagination from "@/components/Pagination";
import RadioCheckButtonh from "@/components/RadioCheckButtonh";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { clearImagingPatientSelection, hideModal, imagingPatientSelected } from "@/redux/slices/dialogslice";
import { patientService } from "@/redux/services/patientService";
import type { PatientSummary } from "@/types/patient";
import { formatDateOnly, humanizeEnum } from "@/utils/formatters";

const PAGE_SIZE = 8;
const fullName = (patient: PatientSummary) =>
  [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ");

const SelectImagingPatientModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.SelectImagingPatient);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    if (open) setSelectedPatient(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    patientService.listPatients(
      {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.length >= 2 ? debouncedSearch : "",
        status: "",
        administrativeGender: "",
        sortBy: "lastName",
        sortOrder: "asc",
      },
      controller.signal,
    ).then((result) => {
      setPatients(result.items);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setTotalItems(result.pagination.totalItems);
    }).catch((requestError: unknown) => {
      if (controller.signal.aborted) return;
      setError(requestError instanceof Error ? requestError.message : "Patients could not be loaded.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [open, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const close = () => {
    setSelectedPatient(null);
    dispatch(hideModal("SelectImagingPatient"));
    dispatch(clearImagingPatientSelection());
  };

  const confirmSelection = async () => {
    if (!selectedPatient) return;
    setLoadingId(selectedPatient.id);
    setError(null);
    try {
      const patient = await patientService.getPatient(selectedPatient.id);
      dispatch(imagingPatientSelected(patient));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Patient details could not be loaded.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={close}
      title="Select Patient"
      subtitle="Search the patient list and select a record for this imaging referral."
      width={760}
      footer={(
        <div className="flex justify-end">
          <div className="flex gap-3">
            <ImportButton text="Cancel" icon={null} onClick={close} />
            <AddButton
              text={loadingId ? "Loading..." : "Select"}
              icon={null}
              disabled={!selectedPatient || loadingId !== null}
              onClick={() => void confirmSelection()}
              className={loadingId ? "min-w-24" : ""}
            />
          </div>
        </div>
      )}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
        <input
          value={search}
          onChange={(event) => {
            setSelectedPatient(null);
            setSearch(event.target.value);
          }}
          placeholder="Search by patient name, MRN, email or phone..."
          className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-heading outline-none focus:border-primary"
        />
      </div>

      {error && <p role="alert" className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="min-h-48">
        {loading ? (
          <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-body">Loading patients...</p>
        ) : patients.length ? (
          <ul className="space-y-2">
            {patients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              return (
                <li key={patient.id}>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <RadioCheckButtonh
                      type="radio"
                      name="imagingPatient"
                      checked={isSelected}
                      disabled={loadingId !== null}
                      onChange={() => setSelectedPatient(patient)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-heading">{fullName(patient)}</span>
                      <span className="mt-0.5 block truncate text-xs text-body">
                        MRN: {patient.medicalRecordNumber} · DOB: {formatDateOnly(patient.dateOfBirth)} · {humanizeEnum(patient.administrativeGender)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-body">No patients found.</p>
        )}
      </div>

      {totalItems > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          itemLabel="patients"
          onChange={(nextPage) => {
            setSelectedPatient(null);
            setPage(nextPage);
          }}
        />
      )}
    </ModalShell>
  );
};

export default SelectImagingPatientModal;
