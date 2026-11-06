"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  FlaskConical,
  MapPin,
  Pill,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import ImportButton from "@/components/ImportButton";
import { cardCls } from "@/providers/Shared";
import NotificationList, { type NotificationCategory, type NotificationItem } from "./Notificationlist";
import NotificationDetail from "./Notificationdetail";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const SETTINGS_HREF = "/settings/system-preferences"; // TODO: point to your notification settings route

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1", category: "appointments", title: "Appointment Reminder", time: "10:30 AM", fullTime: "Today, 10:30 AM", Icon: Calendar,
    preview: "Your appointment with Dr. Rohan Mehta is tomorrow at 10:30 AM.",
    greeting: "Hi Jane,", intro: "This is a reminder for your upcoming appointment:",
    fields: [
      { Icon: Calendar, label: "Date", value: "Nov 10, 2026" },
      { Icon: Clock, label: "Time", value: "10:30 AM" },
      { Icon: UserCog, label: "Provider", value: "Dr. Rohan Mehta" },
      { Icon: MapPin, label: "Location", value: "Main Clinic, Science City" },
    ],
    outro: "Please arrive 10 minutes early for a smooth check-in.",
    actions: [
      { label: "View Appointment", href: "/appointments" },
      { label: "Reschedule", href: "/appointments", variant: "secondary" },
    ],
  },
  {
    id: "2", category: "lab", title: "Lab Results Available", time: "Yesterday", fullTime: "Yesterday, 4:15 PM", Icon: FlaskConical,
    preview: "Your lab results for Test ID #L-1043 are now ready.",
    greeting: "Hi Jane,", intro: "Your laboratory results are now available to view:",
    fields: [
      { Icon: FileText, label: "Test ID", value: "#L-1043" },
      { Icon: FlaskConical, label: "Test", value: "Complete Blood Count" },
      { Icon: Calendar, label: "Collected On", value: "Nov 4, 2026" },
      { Icon: UserCog, label: "Ordered By", value: "Dr. Rohan Mehta" },
    ],
    outro: "If you have questions about your results, please contact your provider.",
    actions: [{ label: "View Results", href: "/lab-results" }],
  },
  {
    id: "3", category: "prescriptions", title: "Prescription Ready", time: "Oct 30", fullTime: "Oct 30, 2026, 11:20 AM", Icon: Pill,
    preview: "A new prescription has been added to your record.",
    greeting: "Hi Jane,", intro: "A new prescription has been added to your record:",
    fields: [
      { Icon: Pill, label: "Medication", value: "Amoxicillin 500 mg" },
      { Icon: UserCog, label: "Prescribed By", value: "Dr. Rohan Mehta" },
      { Icon: Calendar, label: "Date", value: "Oct 30, 2026" },
      { Icon: FileText, label: "Refills", value: "2 remaining" },
    ],
    outro: "Take the medication exactly as directed by your provider.",
    actions: [{ label: "View Prescription", href: "/prescriptions" }],
  },
  {
    id: "4", category: "payments", title: "Payment Successful", time: "Oct 29", fullTime: "Oct 29, 2026, 2:05 PM", Icon: CreditCard,
    preview: "Your payment of ₹1,500 was successful.",
    greeting: "Hi Jane,", intro: "We have received your payment. Here are the details:",
    fields: [
      { Icon: CreditCard, label: "Amount", value: "₹1,500" },
      { Icon: CreditCard, label: "Method", value: "Card ending 4242" },
      { Icon: Calendar, label: "Date", value: "Oct 29, 2026" },
      { Icon: FileText, label: "Transaction ID", value: "TXN-90412" },
    ],
    outro: "A receipt has been saved to your account.",
    actions: [{ label: "View Payments", href: "/manage/payments" }],
  },
  {
    id: "5", category: "appointments", title: "Appointment Rescheduled", time: "Oct 27", fullTime: "Oct 27, 2026, 9:40 AM", Icon: Calendar,
    preview: "Your appointment on Oct 28 has been rescheduled.",
    greeting: "Hi Jane,", intro: "Your appointment has been moved to a new time:",
    fields: [
      { Icon: Calendar, label: "New Date", value: "Oct 30, 2026" },
      { Icon: Clock, label: "New Time", value: "11:00 AM" },
      { Icon: UserCog, label: "Provider", value: "Dr. Rohan Mehta" },
      { Icon: MapPin, label: "Location", value: "Main Clinic, Science City" },
    ],
    outro: "Your previous slot on Oct 28 at 2:00 PM has been released.",
    actions: [
      { label: "View Appointment", href: "/appointments" },
      { label: "Reschedule", href: "/appointments", variant: "secondary" },
    ],
  },
  {
    id: "6", category: "system", title: "New Document Added", time: "Oct 26", fullTime: "Oct 26, 2026, 5:10 PM", Icon: FileText,
    preview: "A new document (Discharge Summary) is available.",
    greeting: "Hi Jane,", intro: "A new document has been added to your record:",
    fields: [
      { Icon: FileText, label: "Document", value: "Discharge Summary" },
      { Icon: FileText, label: "Type", value: "PDF" },
      { Icon: UserCog, label: "Added By", value: "Dr. Rohan Mehta" },
      { Icon: Calendar, label: "Date", value: "Oct 26, 2026" },
    ],
    actions: [{ label: "View Document", href: "/dashboard" }], // TODO: documents route
  },
  {
    id: "7", category: "system", title: "Referral Update", time: "Oct 24", fullTime: "Oct 24, 2026, 1:30 PM", Icon: Users,
    preview: "Your referral to Cardiology has been processed.",
    greeting: "Hi Jane,", intro: "There is an update on your referral:",
    fields: [
      { Icon: Users, label: "Specialty", value: "Cardiology" },
      { Icon: UserCog, label: "Referred To", value: "Dr. Michael Johnson" },
      { Icon: Check, label: "Status", value: "Processed" },
      { Icon: Calendar, label: "Date", value: "Oct 24, 2026" },
    ],
    outro: "The specialist's office will contact you to schedule a visit.",
    actions: [{ label: "View Referral", href: "/referral/management" }],
  },
  {
    id: "8", category: "system", title: "Membership Renewal", time: "Oct 22", fullTime: "Oct 22, 2026, 10:00 AM", Icon: ShieldCheck,
    preview: "Your membership will expire on Nov 30, 2026.",
    greeting: "Hi Jane,", intro: "Your membership is due for renewal soon:",
    fields: [
      { Icon: ShieldCheck, label: "Plan", value: "Gold" },
      { Icon: Calendar, label: "Expires On", value: "Nov 30, 2026" },
      { Icon: CreditCard, label: "Renewal Fee", value: "₹4,999" },
      { Icon: Clock, label: "Days Left", value: "24 days" },
    ],
    outro: "Renew before the expiry date to keep your benefits without a break.",
    actions: [{ label: "Renew Membership", href: "/membership/plans" }],
  },
  {
    id: "9", category: "appointments", title: "Appointment Confirmed", time: "Oct 20", fullTime: "Oct 20, 2026, 3:45 PM", Icon: Calendar,
    preview: "Your appointment with Dr. Emily Parker is confirmed.",
    greeting: "Hi Jane,", intro: "Your appointment has been confirmed:",
    fields: [
      { Icon: Calendar, label: "Date", value: "Oct 22, 2026" },
      { Icon: Clock, label: "Time", value: "9:00 AM" },
      { Icon: UserCog, label: "Provider", value: "Dr. Emily Parker" },
      { Icon: MapPin, label: "Location", value: "West Wing, Children's Hospital" },
    ],
    actions: [{ label: "View Appointment", href: "/appointments" }],
  },
  {
    id: "10", category: "payments", title: "Payment Due", time: "Oct 18", fullTime: "Oct 18, 2026, 8:00 AM", Icon: CreditCard,
    preview: "An invoice of ₹2,200 is due on Oct 25.",
    greeting: "Hi Jane,", intro: "You have an invoice waiting for payment:",
    fields: [
      { Icon: FileText, label: "Invoice", value: "INV-3021" },
      { Icon: CreditCard, label: "Amount Due", value: "₹2,200" },
      { Icon: Calendar, label: "Due Date", value: "Oct 25, 2026" },
      { Icon: Clock, label: "Status", value: "Pending" },
    ],
    actions: [{ label: "Pay Now", href: "/manage/invoice" }],
  },
  {
    id: "11", category: "lab", title: "Lab Order Placed", time: "Oct 15", fullTime: "Oct 15, 2026, 12:10 PM", Icon: FlaskConical,
    preview: "A lab order was placed for Test ID #L-1043.",
    greeting: "Hi Jane,", intro: "A new laboratory order was placed for you:",
    fields: [
      { Icon: FileText, label: "Test ID", value: "#L-1043" },
      { Icon: FlaskConical, label: "Test", value: "Complete Blood Count" },
      { Icon: UserCog, label: "Ordered By", value: "Dr. Rohan Mehta" },
      { Icon: MapPin, label: "Collection", value: "Main Clinic Lab" },
    ],
    actions: [{ label: "View Lab Orders", href: "/lab-results" }],
  },
  {
    id: "12", category: "system", title: "Security Alert", time: "Oct 12", fullTime: "Oct 12, 2026, 7:55 PM", Icon: Bell,
    preview: "Your password was changed successfully.",
    greeting: "Hi Jane,", intro: "The password for your account was changed:",
    fields: [
      { Icon: Calendar, label: "Date", value: "Oct 12, 2026" },
      { Icon: Clock, label: "Time", value: "7:55 PM" },
      { Icon: MapPin, label: "Location", value: "Ahmedabad, India" },
      { Icon: ShieldCheck, label: "Status", value: "Successful" },
    ],
    outro: "If this wasn't you, please reset your password immediately.",
    actions: [{ label: "Account Settings", href: SETTINGS_HREF }],
  },
];

const INITIAL_UNREAD = ["1", "2", "3"];

type TabKey = "all" | NotificationCategory;

const TABS: { key: TabKey; label: string; Icon?: typeof Bell }[] = [
  { key: "all", label: "All" },
  { key: "appointments", label: "Appointments", Icon: Calendar },
  { key: "lab", label: "Lab Results", Icon: FlaskConical },
  { key: "prescriptions", label: "Prescriptions", Icon: Pill },
  { key: "payments", label: "Payments", Icon: CreditCard },
  { key: "system", label: "System", Icon: Bell },
];

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/*  2xl and up → list + detail side by side.                         */
/*  Below 2xl  → list only; clicking a notification opens the       */
/*               detail in its place, with a "Back" button.         */
/* ---------------------------------------------------------------- */
const Notifications = () => {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set(INITIAL_UNREAD));
  const [tab, setTab] = useState<TabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>("1");
  /** Only matters below 2xl: false = list is visible, true = detail is visible. */
  const [showDetail, setShowDetail] = useState(false);

  const filtered = useMemo(() => (tab === "all" ? items : items.filter((i) => i.category === tab)), [items, tab]);

  /** Falls back to the first visible item when the selection is filtered out. */
  const activeId = filtered.some((i) => i.id === selectedId) ? selectedId : (filtered[0]?.id ?? null);
  const active = filtered.find((i) => i.id === activeId) ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    setShowDetail(true);
    setUnreadIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const changeTab = (key: TabKey) => {
    setTab(key);
    setShowDetail(false);
  };

  const markAllRead = () => setUnreadIds(new Set());

  const toggleUnread = (id: string) =>
    setUnreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remove = (id: string) => {
    // TODO: dispatch(deleteNotification(id))
    const index = filtered.findIndex((i) => i.id === id);
    const neighbour = filtered[index + 1] ?? filtered[index - 1];
    setItems((prev) => prev.filter((i) => i.id !== id));
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedId(neighbour?.id ?? null);
    setShowDetail(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Notifications</h2>
            <p className="mt-0.5 text-sm text-body">Stay updated on your appointments, results, prescriptions and more.</p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadIds.size === 0}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            <Check className="h-4 w-4" />
            Mark All as Read
          </button>
          <ImportButton
            text="Notification Settings"
            icon={<Settings className="h-4 w-4" />}
            className="shrink-0 whitespace-nowrap"
            onClick={() => router.push(SETTINGS_HREF)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Notification categories"
        className="hide-scrollbar flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card px-3 py-2.5 sm:gap-3"
      >
        {TABS.map(({ key, label, Icon }) => {
          const activeTab = key === tab;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={activeTab}
              onClick={() => changeTab(key)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                activeTab ? "bg-primary/10 font-semibold text-primary" : "text-heading hover:bg-primary/5"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {key === "all" && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                  {items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List + detail */}
      <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className={`${cardCls} p-2 sm:p-3 ${showDetail ? "hidden 2xl:block" : "block"}`}>
          <NotificationList items={filtered} selectedId={activeId} unreadIds={unreadIds} onSelect={select} />
        </section>
        <section className={`${cardCls} sm:p-6 ${showDetail ? "block" : "hidden 2xl:block"}`}>
          <NotificationDetail
            key={active?.id ?? "none"}
            item={active}
            isUnread={active ? unreadIds.has(active.id) : false}
            onDelete={remove}
            onToggleUnread={toggleUnread}
            onBack={() => setShowDetail(false)}
          />
        </section>
      </div>
    </div>
  );
};

export default Notifications;