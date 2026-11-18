"use client";

import React, { useEffect, useState } from "react";
import { Calendar, File, FileText, FlaskConical, Lock, Pill, Users } from "lucide-react";

import AddButton from "@/components/Addbutton";
import RightSubSection from "@/components/RightSubSection"; // TODO: adjust to where your common right section lives
import MessageList, { type Attachment, type ChatMessage, type Conversation, type EmrItem, type PatientInfo } from "./MessageList";
import MessageChat from "./MessageChat";
import MessageContext from "./MessageContext";
import { plainTextOf, type SendPayload } from "./MessageComposer";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const emr = (next: string, last: string, lab: string, rx: string, docs: string): EmrItem[] => [
  { Icon: Calendar, title: "Appointments", subtitle: next, href: "/appointments" },
  { Icon: FileText, title: "Encounter Notes", subtitle: last, href: "/encounters" },
  { Icon: FlaskConical, title: "Lab Results", subtitle: lab, href: "/lab-results" },
  { Icon: Pill, title: "Prescriptions", subtitle: rx, href: "/prescriptions" },
  { Icon: File, title: "Documents", subtitle: docs, href: "/patients" }, // TODO: documents route
];

const vitals = (bp: string, hr: string, temp: string, spo2: string) => [
  { label: "Blood Pressure", value: bp },
  { label: "Heart Rate", value: hr },
  { label: "Temperature", value: temp },
  { label: "SpO₂", value: spo2 },
];

const JOHN: PatientInfo = {
  name: "John Doe", mrn: "P-1043", age: "36 Y", gender: "Male", dob: "Mar 14, 1990", status: "Active",
  provider: "Dr. Rohan Mehta", phone: "+1 (555) 214-6633", email: "john.doe@example.com", insurance: "BlueShield PPO · #BS-4471920",
  allergies: ["Penicillin"], conditions: ["Vitamin D deficiency", "Hypertension"],
  vitals: vitals("128/82 mmHg", "76 bpm", "98.4 °F", "98 %"),
  related: emr("Next: Nov 12, 2026", "Last: Oct 20, 2026", "Oct 28, 2026", "Active: 2", "3 files"),
};

const MARIA: PatientInfo = {
  name: "Maria Garcia", mrn: "P-1021", age: "54 Y", gender: "Female", dob: "Jun 2, 1972", status: "Active",
  provider: "Dr. Anjali Desai", phone: "+1 (555) 330-1190", email: "maria.garcia@example.com", insurance: "Aetna HMO · #AE-2210984",
  allergies: [], conditions: ["Atrial fibrillation", "Type 2 diabetes"],
  vitals: vitals("134/86 mmHg", "88 bpm", "98.1 °F", "97 %"),
  related: emr("Next: Nov 18, 2026", "Last: Oct 14, 2026", "Oct 22, 2026", "Active: 3", "5 files"),
};

const ROBERT: PatientInfo = {
  name: "Robert Johnson", mrn: "P-1008", age: "51 Y", gender: "Male", dob: "Jan 21, 1975", status: "Active",
  provider: "Dr. Michael Johnson", phone: "+1 (555) 871-4402", email: "robert.johnson@example.com", insurance: "Cigna PPO · #CG-9087713",
  allergies: ["Latex", "Sulfa drugs"], conditions: ["Asthma"],
  vitals: vitals("122/78 mmHg", "72 bpm", "98.6 °F", "99 %"),
  related: emr("Next: Nov 20, 2026", "Last: Oct 30, 2026", "Oct 29, 2026", "Active: 1", "2 files"),
};

const OLIVIA: PatientInfo = {
  name: "Olivia Brown", mrn: "P-1057", age: "33 Y", gender: "Female", dob: "Sep 9, 1993", status: "Active",
  provider: "Dr. Emily Parker", phone: "+1 (555) 602-7719", email: "olivia.brown@example.com", insurance: "United Health · #UH-5530126",
  allergies: [], conditions: ["Hyperlipidemia"],
  vitals: vitals("118/76 mmHg", "70 bpm", "98.2 °F", "99 %"),
  related: emr("Next: Nov 9, 2026", "Last: Oct 29, 2026", "Oct 25, 2026", "Active: 2", "1 file"),
};

const WILLIAM: PatientInfo = {
  name: "William Davis", mrn: "P-1032", age: "58 Y", gender: "Male", dob: "Apr 30, 1968", status: "Active",
  provider: "Dr. Robert Williams", phone: "+1 (555) 449-2086", email: "william.davis@example.com", insurance: "Medicare · #MC-1189042",
  allergies: ["Aspirin"], conditions: ["Osteoarthritis", "Hypothyroidism", "Hypertension"],
  vitals: vitals("140/90 mmHg", "80 bpm", "98.0 °F", "96 %"),
  related: emr("Next: Dec 2, 2026", "Last: Oct 27, 2026", "Oct 18, 2026", "Active: 4", "2 files"),
};

const msg = (id: string, from: ChatMessage["from"], day: string, time: string, text: string): ChatMessage => ({
  id,
  from,
  day,
  time,
  text,
});

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1", name: "Dr. Rohan Mehta", role: "General Physician", initials: "RM", tone: "primary",
    subject: "Re: Lab results for John D.", preview: "The latest lab results are attached for review.", time: "10:24 AM",
    starred: true, archived: false, patient: JOHN,
    messages: [
      msg("1-1", "them", "Today", "10:12 AM", "Hi Jane, can you share the latest lab results for John Doe (MRN: P-1043)?"),
      msg("1-2", "me", "Today", "10:18 AM", "Yes, I've attached the results. All key parameters are within range except Vitamin D, which is low."),
      msg("1-3", "them", "Today", "10:24 AM", "Thanks. Please add a note in the EMR and recommend Vitamin D supplementation."),
      { id: "1-4", from: "me", day: "Today", time: "10:25 AM", attachments: [{ name: "Lab_Results_P-1043.pdf", size: "1.2 MB", kind: "document" }] },
    ],
  },
  {
    id: "2", name: "Dr. Anjali Desai", role: "Cardiologist", initials: "AD", tone: "primary",
    subject: "Patient follow-up", preview: "Please schedule a follow-up for the patient.", time: "Yesterday",
    starred: false, archived: false, patient: MARIA,
    messages: [
      msg("2-1", "them", "Yesterday", "3:40 PM", "Hi Jane, Maria Garcia's ECG looks stable."),
      msg("2-2", "them", "Yesterday", "3:42 PM", "Please schedule a follow-up for the patient in two weeks."),
    ],
  },
  {
    id: "3", name: "Care Team – Sarah P.", role: "Care coordination group", initials: "CT", Icon: Users, tone: "primary",
    subject: "Post-visit care instructions", preview: "Updated the discharge notes and care plan.", time: "Oct 30",
    starred: true, archived: false, patient: ROBERT,
    messages: [
      msg("3-1", "them", "Oct 30", "9:05 AM", "Updated the discharge notes and care plan for Mr. Johnson."),
      msg("3-2", "me", "Oct 30", "9:20 AM", "Thanks Sarah, I'll review them before his next visit."),
    ],
  },
  {
    id: "4", name: "Nursing – Block B", role: "Nursing team", initials: "NB", tone: "teal",
    subject: "Medication update", preview: "Patient #P-1057 has been started on the new dose.", time: "Oct 29",
    starred: false, archived: false, patient: OLIVIA,
    messages: [
      msg("4-1", "them", "Oct 29", "11:15 AM", "Patient #P-1057 has been started on the new dose as ordered."),
      msg("4-2", "me", "Oct 29", "11:30 AM", "Great. Please monitor and report any side effects."),
    ],
  },
  {
    id: "5", name: "Lab Team", role: "Laboratory", initials: "LB", tone: "primary",
    subject: "Lab results ready", preview: "Lab results for #P-1043 are now available.", time: "Oct 28",
    starred: false, archived: false, patient: JOHN,
    messages: [msg("5-1", "them", "Oct 28", "4:50 PM", "Lab results for #P-1043 are now available in the EMR.")],
  },
  {
    id: "6", name: "Pharmacy Desk", role: "Pharmacy", initials: "PD", tone: "teal",
    subject: "Prescription clarification", preview: "Can you confirm the dosage for #P-1032?", time: "Oct 27",
    starred: false, archived: false, patient: WILLIAM,
    messages: [msg("6-1", "them", "Oct 27", "1:12 PM", "Can you confirm the dosage for #P-1032? The prescription is unclear.")],
  },
  {
    id: "7", name: "Dr. Michael Johnson", role: "Cardiology", initials: "MJ", tone: "primary",
    subject: "Referral accepted", preview: "I've accepted the referral and will see the patient.", time: "Oct 25",
    starred: false, archived: true, patient: null,
    messages: [msg("7-1", "them", "Oct 25", "10:00 AM", "I've accepted the referral and will see the patient next week.")],
  },
];

const INITIAL_UNREAD = ["1", "2", "6"];

const nowLabel = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** What the conversation list shows for a message. */
const previewOf = (text: string, attachments: Attachment[]) =>
  text || (attachments.length > 1 ? `${attachments.length} attachments` : (attachments[0]?.name ?? ""));

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/*  xl and up  → list + chat side by side.                           */
/*  Below xl   → list only; opening a conversation shows the chat    */
/*               FULL SCREEN (like WhatsApp) with a back arrow.      */
/*  2xl        → the Patient Context panel is the third column of   */
/*               the same card; the info icon shows / hides it.      */
/*  Below 2xl  → the panel opens as an overlay with a blurred        */
/*               backdrop (RightSubSection).                         */
/* ---------------------------------------------------------------- */
const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set(INITIAL_UNREAD));
  const [selectedId, setSelectedId] = useState<string>("1");
  /** Only matters below xl: false = list is visible, true = full-screen chat. */
  const [chatOpen, setChatOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* Default the panel open on 2xl screens and closed below that breakpoint. */
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1536px)");
    const syncPanelWithViewport = (event: MediaQueryListEvent) => setRightOpen(event.matches);

    setRightOpen(desktopQuery.matches);
    desktopQuery.addEventListener("change", syncPanelWithViewport);
    return () => desktopQuery.removeEventListener("change", syncPanelWithViewport);
  }, []);

  /* The full-screen chat must not let the page behind it scroll. */
  useEffect(() => {
    if (!chatOpen || !window.matchMedia("(max-width: 1279px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [chatOpen]);

  const active = conversations.find((c) => c.id === selectedId) ?? conversations[0];

  const select = (id: string) => {
    setSelectedId(id);
    setChatOpen(true);
    setUnreadIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const send = ({ text, attachments }: SendPayload) => {
    // TODO: dispatch(sendMessage({ conversationId: active.id, text, attachments }))
    const message: ChatMessage = {
      id: `${active.id}-${Date.now()}`,
      from: "me",
      day: "Today",
      time: nowLabel(),
      text: text || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, message], preview: previewOf(plainTextOf(text), attachments), time: message.time }
          : c,
      ),
    );
  };

  const toggleStar = () =>
    setConversations((prev) => prev.map((c) => (c.id === active.id ? { ...c, starred: !c.starred } : c)));

  const toggleArchive = () =>
    setConversations((prev) => prev.map((c) => (c.id === active.id ? { ...c, archived: !c.archived } : c)));

  const newMessage = () => {
    // TODO: replace with your compose flow (recipient picker). For now it opens an empty draft conversation.
    const id = `new-${Date.now()}`;
    const draft: Conversation = {
      id, name: "New Message", role: "Choose a recipient", initials: "NM", tone: "primary",
      subject: "New conversation", preview: "No messages yet", time: nowLabel(),
      starred: false, archived: false, patient: null, messages: [],
    };
    setConversations((prev) => [draft, ...prev]);
    select(id);
  };

  const backToList = () => {
    setChatOpen(false);
    setRightOpen(false); // below 2xl the panel is an overlay – don't leave it open over the list
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
            <Lock className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-heading sm:text-xl 2xl:text-2xl">Messages</h2>
            <p className="mt-0.5 hidden text-sm text-body sm:block">
              Secure, internal communication for patient care, staff coordination and EMR updates.
            </p>
          </div>
        </div>
        <AddButton text="New Message" onClick={newMessage} className="shrink-0 whitespace-nowrap" />
      </div>

      {/* One card: list | chat | patient context */}
      <div className="relative flex h-[calc(100dvh-10rem)] min-h-[420px] overflow-hidden rounded-[14px] border border-border bg-card sm:h-[calc(100dvh-12rem)] sm:min-h-[480px] lg:h-[calc(100dvh-11.5rem)] 2xl:h-[calc(100dvh-12rem)] 2xl:min-h-0">
        {/* Left – conversation list */}
        <section
          aria-label="Conversations"
          className={`min-h-0 w-full flex-col border-border xl:w-[340px] xl:shrink-0 xl:border-r 2xl:w-[360px] ${
            chatOpen ? "hidden xl:flex" : "flex"
          }`}
        >
          <MessageList conversations={conversations} selectedId={active.id} unreadIds={unreadIds} onSelect={select} />
        </section>

        {/* Center – chat (full screen below xl) */}
        <section
          aria-label="Chat"
          className={`min-h-0 min-w-0 flex-1 ${
            chatOpen
              ? "fixed inset-0 z-[135] flex bg-card pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] xl:static xl:inset-auto xl:z-auto xl:p-0"
              : "hidden xl:flex"
          }`}
        >
          <MessageChat
            key={active.id}
            conversation={active}
            infoOpen={rightOpen}
            onBack={backToList}
            onToggleInfo={() => setRightOpen((o) => !o)}
            onOpenInfo={() => setRightOpen(true)}
            onSend={send}
          />
        </section>

        {/* Right – patient context.
            2xl: third column of this card (the overrides drop the panel's own card border/radius).
            Below 2xl: overlay with a blurred backdrop (RightSubSection). */}
        <RightSubSection
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          width={340}
          ariaLabel="Patient context"
          disableMobileTransition
          className="2xl:!h-full 2xl:!rounded-none 2xl:!border-y-0 2xl:!border-r-0"
        >
          {(closePanel) => (
            <MessageContext conversation={active} onClose={closePanel} onToggleStar={toggleStar} onToggleArchive={toggleArchive} />
          )}
        </RightSubSection>
      </div>
    </div>
  );
};

export default Messages;