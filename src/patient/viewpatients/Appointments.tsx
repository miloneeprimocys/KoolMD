"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, CheckCircle2, Clock, History, Video, XCircle } from "lucide-react";

import StatCards, { type StatItem } from "@/components/Statcards";
import Table from "@/components/Table";
import TableStatus from "@/components/TableStatus";
import Content from "@/components/Content";
import Tags, { type TagTone } from "@/components/Tags";
import AddButton from "@/components/Addbutton";
import Pagination from "@/components/Pagination";
import { PERMISSIONS } from "@/auth/permissions";
import { usePermission } from "@/hooks/usePermission";
import { patientService } from "@/redux/services/patientService";
import { toRequestError, type RequestError } from "@/redux/thunks/thunkHelpers";
import type { PaginationMeta } from "@/types/api";
import type { AppointmentStatus, PatientAppointment } from "@/types/patient";
import { formatCount, formatDateTime, humanizeEnum } from "@/utils/formatters";
import { col, ScrollArea, SectionCard } from "./sectionLayout";

const UPCOMING_LIMIT = 5;
const HISTORY_PAGE_SIZE = 10;
/** Appointments still ahead of the patient. */
const UPCOMING_STATUSES = "SCHEDULED,CONFIRMED,CHECKED_IN";

const STATUS_TONES: Record<AppointmentStatus, TagTone> = {
  SCHEDULED: "info",
  CONFIRMED: "success",
  CHECKED_IN: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
  RESCHEDULED: "warning",
};

interface AppointmentsData {
  upcoming: PatientAppointment[];
  history: PatientAppointment[];
  historyPagination: PaginationMeta;
  counts: { total: number; upcoming: number; completed: number; cancelled: number };
}

/**
 * Upcoming visits, paged history and counts for one patient. Counts use `limit=1` queries
 * (only the total is read), so no full list is downloaded.
 */
function usePatientAppointments(patientId: string, historyPage: number) {
  const [data, setData] = useState<AppointmentsData | null>(null);
  const [error, setError] = useState<RequestError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const list = (query: Omit<Parameters<typeof patientService.listPatientAppointments>[0], "patientId">) =>
      patientService.listPatientAppointments({ patientId, ...query }, signal);
    const now = new Date().toISOString();

    Promise.all([
      list({ page: 1, limit: UPCOMING_LIMIT, sortOrder: "asc", from: now, statuses: UPCOMING_STATUSES }),
      list({ page: historyPage, limit: HISTORY_PAGE_SIZE, sortOrder: "desc", to: now }),
      list({ page: 1, limit: 1, sortOrder: "desc" }),
      list({ page: 1, limit: 1, sortOrder: "desc", statuses: "COMPLETED" }),
      list({ page: 1, limit: 1, sortOrder: "desc", statuses: "CANCELLED,NO_SHOW" }),
    ])
      .then(([upcoming, history, total, completed, cancelled]) => {
        setError(null);
        setData({
          upcoming: upcoming.items,
          history: history.items,
          historyPagination: history.pagination,
          counts: {
            total: total.pagination.totalItems,
            upcoming: upcoming.pagination.totalItems,
            completed: completed.pagination.totalItems,
            cancelled: cancelled.pagination.totalItems,
          },
        });
      })
      .catch((requestError: unknown) => {
        if (!signal.aborted) setError(toRequestError(requestError));
      });
    return () => controller.abort();
  }, [patientId, historyPage, reloadKey]);

  return { data, error, reload: () => setReloadKey((key) => key + 1) };
}

const providerName = (appointment: PatientAppointment) =>
  [`Dr. ${appointment.practitioner.firstName} ${appointment.practitioner.lastName}`, appointment.practitioner.credentials]
    .filter(Boolean)
    .join(", ");

const ModeLabel = ({ appointment }: { appointment: PatientAppointment }) => {
  const isVideo = appointment.consultationMode === "TELEMEDICINE";
  const Icon = isVideo ? Video : Building2;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-body">
      <Icon className="h-3.5 w-3.5" />
      {isVideo ? "Telemedicine" : (appointment.location?.name ?? "In person")}
    </span>
  );
};

const Appointments = ({ patientId }: { patientId: string }) => {
  const router = useRouter();
  const canBook = usePermission(PERMISSIONS.APPOINTMENT_READ);
  const [historyPage, setHistoryPage] = useState(1);
  const { data, error, reload } = usePatientAppointments(patientId, historyPage);

  if (!data) {
    return (
      <div className="rounded-[14px] border border-border bg-card">
        {error ? (
          <TableStatus variant="error" message={error.message} onRetry={reload} />
        ) : (
          <TableStatus variant="loading" message="Loading appointments…" />
        )}
      </div>
    );
  }

  const stats: StatItem[] = [
    { label: "Total Appointments", value: formatCount(data.counts.total), Icon: CalendarDays, accent: "primary" },
    { label: "Upcoming", value: formatCount(data.counts.upcoming), Icon: Clock, accent: "violet" },
    { label: "Completed", value: formatCount(data.counts.completed), Icon: CheckCircle2, accent: "success" },
    { label: "Cancelled / No-show", value: formatCount(data.counts.cancelled), Icon: XCircle, accent: "danger" },
  ];

  const historyRows = data.history.map((appointment) => ({
    date: <Content title={formatDateTime(appointment.startsAt, appointment.timeZone)} truncate />,
    type: <Content title={appointment.appointmentType.name} description={appointment.reasonForVisit ?? undefined} truncate />,
    provider: <Content title={providerName(appointment)} truncate />,
    mode: <ModeLabel appointment={appointment} />,
    status: <Tags text={humanizeEnum(appointment.status)} tone={STATUS_TONES[appointment.status]} />,
    notes: <Content title={appointment.cancellationReason ?? "—"} truncate />,
  }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <StatCards stats={stats} />

      <SectionCard
        className="!h-auto"
        icon={Clock}
        tone="violet"
        title="Upcoming Appointments"
        subtitle={data.counts.upcoming > UPCOMING_LIMIT ? `Next ${UPCOMING_LIMIT} of ${data.counts.upcoming}` : undefined}
        action={canBook ? <AddButton text="Book Appointment" onClick={() => router.push("/book-appointment")} /> : undefined}
      >
        {data.upcoming.length === 0 ? (
          <TableStatus variant="empty" message="No upcoming appointments." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {data.upcoming.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-heading">{appointment.appointmentType.name}</p>
                  <p className="text-xs text-body">{formatDateTime(appointment.startsAt, appointment.timeZone)}</p>
                  <p className="text-xs text-body">{providerName(appointment)}</p>
                  <ModeLabel appointment={appointment} />
                </div>
                <Tags text={humanizeEnum(appointment.status)} tone={STATUS_TONES[appointment.status]} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard className="!h-auto" icon={History} tone="blue" title="Appointment History">
        {historyRows.length === 0 ? (
          <TableStatus variant="empty" message="No past appointments." />
        ) : (
          <>
            <ScrollArea>
              <Table
                columns={[
                  col("date", "Date & Time"),
                  col("type", "Visit"),
                  col("provider", "Provider"),
                  col("mode", "Mode"),
                  col("status", "Status"),
                  col("notes", "Cancellation Reason"),
                ]}
                rows={historyRows}
              />
            </ScrollArea>
            {data.historyPagination.totalPages > 1 && (
              <Pagination
                className="mt-3"
                page={historyPage}
                totalPages={data.historyPagination.totalPages}
                totalItems={data.historyPagination.totalItems}
                pageSize={HISTORY_PAGE_SIZE}
                onChange={setHistoryPage}
              />
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
};

export default Appointments;
