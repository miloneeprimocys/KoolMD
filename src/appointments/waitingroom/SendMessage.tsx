"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal } from "@/redux/slices/dialogslice";
import { FieldError } from "@/components/SignupField";
import ModalShell, { ModalCheckboxGroup, ModalTextarea } from "@/components/Modalshell";

const PATIENT = {
  name: "Olivia Bennett",
  id: "PID-10234",
  email: "olivia.bennett@email.com",
  phone: "+1 415 555 0198",
  appointment: "Follow Up · Oct 12, 2026 at 09:00 AM",
};

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const SendMessage = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.dialog.SendWaitingRoomMessage);
  const [channels, setChannels] = useState<string[]>(["email", "sms"]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [channelError, setChannelError] = useState("");
  const close = () => {
    dispatch(hideModal("SendWaitingRoomMessage"));
    setError("");
    setChannelError("");
  };

  const send = () => {
    const trimmedMessage = message.trim();
    setError(trimmedMessage ? "" : "Please enter a message");
    setChannelError(channels.length ? "" : "Select at least one delivery method");
    if (!trimmedMessage || !channels.length) return;

    console.log("Waiting room message sent:", PATIENT.id, { channels, message: trimmedMessage });
    close();
  };

  return (
    <ModalShell
      open={open}
      onClose={close}
      onSubmit={send}
      title="Send Message"
      subtitle="Send an update to the checked-in patient."
      submitText="Send Message"
      width={600}
    >
      <div className="space-y-3 rounded-xl border border-border bg-primary/5 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-heading">{PATIENT.name} ({PATIENT.id})</p>
          <p className="text-xs text-body">{PATIENT.appointment}</p>
        </div>
        <div className="grid gap-2 text-xs text-body sm:grid-cols-2">
          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" />{PATIENT.email}</p>
          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" />{PATIENT.phone}</p>
        </div>
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
          <MessageSquare className="h-4 w-4 text-primary" /> Delivery method
        </div>
        <ModalCheckboxGroup
          label="Send via"
          value={channels}
          onChange={(value) => {
            setChannels(value);
            setChannelError("");
          }}
          options={CHANNELS}
          className="flex flex-wrap gap-x-6 gap-y-2"
        />
        <FieldError message={channelError} />
      </div>
      <div>
        <ModalTextarea
          id="waiting-room-message"
          label="Message"
          placeholder="Write a message for Olivia..."
          value={message}
          onChange={(value) => {
            setMessage(value);
            if (value.trim()) setError("");
          }}
        />
        <FieldError message={error} />
      </div>
    </ModalShell>
  );
};

export default SendMessage;
