import type { TagTone } from "@/components/Tags";

/* Static starting data (replace with API results) */
export type EarningRow = { id: string; date: string; patient: string; visitType: "Telemedicine" | "In-Person"; status: "Completed" | "Pending" | "Cancelled"; amount: number };
export type PaymentRow = { id: string; date: string; reference: string; method: string; status: "Paid" | "Processing"; amount: number };
export type StatementRow = { id: string; month: string; visits: number; total: number };

export const EARNINGS: EarningRow[] = [
  { id: "e1", date: "2026-10-12", patient: "Aarti Sharma", visitType: "Telemedicine", status: "Completed", amount: 120 },
  { id: "e2", date: "2026-10-12", patient: "Rahul Patel", visitType: "In-Person", status: "Completed", amount: 150 },
  { id: "e3", date: "2026-10-11", patient: "Neha Kapoor", visitType: "Telemedicine", status: "Completed", amount: 120 },
  { id: "e4", date: "2026-10-09", patient: "Vikram Shah", visitType: "In-Person", status: "Completed", amount: 150 },
  { id: "e5", date: "2026-10-08", patient: "Priya Mehta", visitType: "Telemedicine", status: "Pending", amount: 120 },
  { id: "e6", date: "2026-09-28", patient: "Karan Joshi", visitType: "In-Person", status: "Completed", amount: 150 },
];

export const PAYMENTS: PaymentRow[] = [
  { id: "p1", date: "2026-10-15", reference: "PAY-10021", method: "Bank Transfer", status: "Processing", amount: 1850 },
  { id: "p2", date: "2026-09-30", reference: "PAY-09987", method: "Bank Transfer", status: "Paid", amount: 3920 },
  { id: "p3", date: "2026-08-31", reference: "PAY-09812", method: "Bank Transfer", status: "Paid", amount: 4105 },
];

export const STATEMENTS: StatementRow[] = [
  { id: "s1", month: "September 2026", visits: 33, total: 3920 },
  { id: "s2", month: "August 2026", visits: 35, total: 4105 },
  { id: "s3", month: "July 2026", visits: 31, total: 3610 },
];

export const STATUS_TONE: Record<string, TagTone> = {
  Completed: "success",
  Paid: "success",
  Pending: "warning",
  Processing: "info",
  Cancelled: "neutral",
};

export const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });