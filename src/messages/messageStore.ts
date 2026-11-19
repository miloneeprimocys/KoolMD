import type { Attachment } from "./MessageList";

const STORAGE_KEY = "koolmd.patient-messages.v1";
const CHANGE_EVENT = "koolmd:patient-messages";

export type SharedPatientMessage = {
  id: string;
  conversationId: string;
  patientEmail: string;
  sender: "admin" | "patient";
  day: string;
  time: string;
  text?: string;
  attachments?: Attachment[];
};

export type SharedPatientMessagesSnapshot = {
  messages: SharedPatientMessage[];
  error: string | null;
};

const EMPTY_SNAPSHOT: SharedPatientMessagesSnapshot = { messages: [], error: null };
const STORAGE_ERROR_SNAPSHOT: SharedPatientMessagesSnapshot = {
  messages: [],
  error: "Messages could not be loaded from this browser. Check the saved message data and reload.",
};
let cachedStorageValue: string | null | undefined;
let cachedSnapshot = EMPTY_SNAPSHOT;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAttachment = (value: unknown): value is Attachment => {
  if (!isRecord(value)) return false;
  return (
    typeof value.name === "string" &&
    typeof value.size === "string" &&
    (value.kind === "image" || value.kind === "video" || value.kind === "audio" || value.kind === "document") &&
    (value.url === undefined || typeof value.url === "string")
  );
};

const isSharedPatientMessage = (value: unknown): value is SharedPatientMessage => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.conversationId === "string" &&
    typeof value.patientEmail === "string" &&
    (value.sender === "admin" || value.sender === "patient") &&
    typeof value.day === "string" &&
    typeof value.time === "string" &&
    (value.text === undefined || typeof value.text === "string") &&
    (value.attachments === undefined || (Array.isArray(value.attachments) && value.attachments.every(isAttachment)))
  );
};

export const getSharedPatientMessagesSnapshot = (): SharedPatientMessagesSnapshot => {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return STORAGE_ERROR_SNAPSHOT;
  }

  if (raw === cachedStorageValue) return cachedSnapshot;
  cachedStorageValue = raw;

  if (!raw) {
    cachedSnapshot = EMPTY_SNAPSHOT;
    return cachedSnapshot;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isSharedPatientMessage)) {
      cachedSnapshot = STORAGE_ERROR_SNAPSHOT;
    } else {
      cachedSnapshot = { messages: parsed, error: null };
    }
  } catch {
    cachedSnapshot = STORAGE_ERROR_SNAPSHOT;
  }
  return cachedSnapshot;
};

export const saveSharedPatientMessage = (message: SharedPatientMessage): SharedPatientMessage[] => {
  const snapshot = getSharedPatientMessagesSnapshot();
  if (snapshot.error) throw new Error(snapshot.error);

  const messages = snapshot.messages;
  const next = [...messages.filter((item) => item.id !== message.id), message];
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  cachedStorageValue = serialized;
  cachedSnapshot = { messages: next, error: null };
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
};

export const getServerSharedPatientMessagesSnapshot = () => EMPTY_SNAPSHOT;

export const subscribeToSharedPatientMessages = (onChange: () => void): (() => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };

  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
};

export const normalizePatientEmail = (email: string | null | undefined) => email?.trim().toLowerCase() ?? "";
