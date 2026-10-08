"use client";

import React, { useMemo, useState } from "react";
import { CalendarX, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

import SignupDropdown from "@/components/SignupDropdown";
import DatePicker from "@/components/Datepicker";
import AddButton from "@/components/Addbutton";
import { TextArea, pad, todayISO, toOptions, uid } from "../Shared";

/* ---------------------------------------------------------------- */
/*  Types                                                           */
/* ---------------------------------------------------------------- */
export interface BlockedDate {
  id: string;
  type: "single" | "range";
  start: string; // ISO
  end: string; // ISO (same as start for single)
  reason: string;
  notes: string;
}

const REASONS = toOptions([
  "Vacation",
  "Conference",
  "Personal Leave",
  "Sick Leave",
  "Holiday",
  "Other",
]);

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ---------------------------------------------------------------- */
/*  Date helpers                                                    */
/* ---------------------------------------------------------------- */
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmt = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const eachDay = (startISO: string, endISO: string) => {
  const out: string[] = [];
  const cur = fromISO(startISO);
  const end = fromISO(endISO);
  let guard = 0;
  while (cur <= end && guard < 366) {
    out.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
};

/* ---------------------------------------------------------------- */
/*  Component                                                       */
/* ---------------------------------------------------------------- */
interface BlockedDatesTabProps {
  blocked: BlockedDate[];
  onChange: (list: BlockedDate[]) => void;
}

const BlockedDatesTab = ({ blocked, onChange }: BlockedDatesTabProps) => {
  const today = todayISO();
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [mode, setMode] = useState<"single" | "range">("single");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [formErr, setFormErr] = useState("");
  const [sort, setSort] = useState("asc");

  const blockedSet = useMemo(() => {
    const s = new Set<string>();
    blocked.forEach((b) => eachDay(b.start, b.end).forEach((d) => s.add(d)));
    return s;
  }, [blocked]);

  const sorted = useMemo(
    () =>
      [...blocked].sort((a, b) =>
        sort === "asc"
          ? a.start.localeCompare(b.start)
          : b.start.localeCompare(a.start),
      ),
    [blocked, sort],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewY, viewM + delta, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  };

  const firstWeekday = new Date(viewY, viewM, 1).getDay();
  const total = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pickDay = (iso: string) => {
    setFormErr("");
    if (mode === "single") return setStart(iso);
    if (!start || end) {
      setStart(iso);
      setEnd("");
    } else if (iso >= start) setEnd(iso);
    else setStart(iso);
  };

  const add = () => {
    if (!start || (mode === "range" && !end)) {
      setFormErr(
        mode === "single" ? "Select a date." : "Select a start and end date.",
      );
      return;
    }
    if (mode === "range" && end < start) {
      setFormErr("End date must be on or after the start date.");
      return;
    }
    onChange([
      ...blocked,
      {
        id: uid(),
        type: mode,
        start,
        end: mode === "single" ? start : end,
        reason,
        notes,
      },
    ]);
    setStart("");
    setEnd("");
    setReason("");
    setNotes("");
    setFormErr("");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Calendar */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8.5rem] text-center text-sm font-semibold text-heading">
              {new Date(viewY, viewM, 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-label transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setViewY(now.getFullYear());
              setViewM(now.getMonth());
            }}
            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1.5 text-xs font-medium text-body">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((d, i) => {
            if (d === null) return <span key={`e-${i}`} />;
            const iso = `${viewY}-${pad(viewM + 1)}-${pad(d)}`;
            const picked =
              iso === start ||
              iso === end ||
              (mode === "range" && start && end && iso > start && iso < end);
            const isBlocked = blockedSet.has(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => pickDay(iso)}
                className={`mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors duration-150 ${
                  picked
                    ? "bg-primary font-semibold text-white"
                    : isBlocked
                      ? "bg-danger/10 font-medium text-danger"
                      : iso === today
                        ? "border border-primary font-medium text-primary hover:bg-primary/10"
                        : "text-heading hover:bg-primary/10"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form + list */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-heading">
            Add Blocked Date
          </h4>

          <div
            role="tablist"
            className="mb-4 inline-flex rounded-lg border border-border p-0.5"
          >
            {(
              [
                { v: "single", l: "Single Date" },
                { v: "range", l: "Date Range" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                role="tab"
                aria-selected={mode === o.v}
                onClick={() => {
                  setMode(o.v);
                  setEnd("");
                  setFormErr("");
                }}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === o.v
                    ? "bg-primary/10 text-primary"
                    : "text-body hover:text-heading"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "single" ? (
              <DatePicker
                name="blockedDate"
                label="Date *"
                value={start}
                onChange={(v) => {
                  setStart(v);
                  setFormErr("");
                }}
                minDate={today}
                error={formErr}
              />
            ) : (
              <>
                <DatePicker
                  name="blockedFrom"
                  label="From *"
                  value={start}
                  onChange={(v) => {
                    setStart(v);
                    if (end && v > end) setEnd("");
                    setFormErr("");
                  }}
                  minDate={today}
                  error={formErr && !start ? formErr : undefined}
                />
                <DatePicker
                  name="blockedTo"
                  label="To *"
                  value={end}
                  onChange={(v) => {
                    setEnd(v);
                    setFormErr("");
                  }}
                  minDate={start || today}
                  error={formErr && start ? formErr : undefined}
                />
              </>
            )}
            <SignupDropdown
              name="blockedReason"
              label="Reason (Optional)"
              placeholder="Select reason"
              options={REASONS}
              value={reason}
              onChange={setReason}
            />
          </div>

          <div className="mt-4">
            <TextArea
              name="blockedNotes"
              label="Notes (Optional)"
              placeholder="Add a note..."
              maxLength={200}
              rows={3}
              value={notes}
              onChange={setNotes}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <AddButton text="Add Blocked Date" icon={null} onClick={add} />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
       <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <h4 className="text-sm font-semibold text-heading">
    Blocked Dates List ({blocked.length})
  </h4>
  <SignupDropdown
    className="w-full sm:!w-[200px]"
    name="blockedSort"
    options={[
      { value: "asc", label: "Date (Upcoming)" },
      { value: "desc", label: "Date (Latest)" },
    ]}
    value={sort}
    onChange={setSort}
  />
</div>

          {sorted.length === 0 ? (
            <p className="rounded-lg bg-primary/5 px-3 py-4 text-center text-sm text-body">
              No blocked dates yet. Add a date or range above.
            </p>
          ) : (
            <ul className="divide-y divide-divider overflow-hidden rounded-lg border border-border">
              {sorted.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <CalendarX className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading">
                      {b.type === "single" || b.start === b.end
                        ? fmt(b.start)
                        : `${fmt(b.start)} – ${fmt(b.end)}`}
                    </span>
                    <span className="block truncate text-xs text-body">
                      {b.reason || "No reason given"}
                      {b.notes ? ` · ${b.notes}` : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label="Delete blocked date"
                    onClick={() =>
                      onChange(blocked.filter((x) => x.id !== b.id))
                    }
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockedDatesTab;