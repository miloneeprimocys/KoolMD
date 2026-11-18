"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import AddButton from "@/components/Addbutton";
import AddSteps from "@/components/Addsteps";
import ImportButton from "@/components/ImportButton";

import FindProvider, { type Provider } from "./FindProvider";
import BookAppointment, { initialBooking, type BookingValues } from "./BookAppointment";
import IntakePayment from "./intakepayment/IntakePayment";

/* ---------- Steps ---------- */
const STEPS = [
  { id: 1, title: "Find a Provider" },
  { id: 2, title: "Book an Appointment" },
  { id: 3, title: "Intake & Payment" },
];

const APPOINTMENTS_ROUTE = "/appointments"; // TODO: where to go after booking

/* ---------- Page ---------- */
const FindProviderMainPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  /** Highest step reached; keeps the intake mounted (and its answers) when going back and forth. */
  const [maxStep, setMaxStep] = useState(1);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [booking, setBooking] = useState<BookingValues | null>(null);
  const [bookingErrors, setBookingErrors] = useState<{ time?: string; reason?: string }>({});

  const goTo = (target: number) => {
    setStep(target);
    setMaxStep((m) => Math.max(m, target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Step 1 → 2: a provider card's "Book Appointment" was clicked. */
  const handleBook = (picked: Provider, slot: string) => {
    if (!provider || provider.id !== picked.id || !booking) {
      setBooking(initialBooking(picked, slot));
      setMaxStep(1); // different provider → start the intake fresh
    } else if (slot) {
      setBooking({ ...booking, time: slot });
    }
    setProvider(picked);
  };

  /** Only completed steps can be clicked in the step bar. */
  const handleStepClick = (id: number) => {
    if (id < step) goTo(id);
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1);
  };

  const handleNext = () => {
    if (step === 1) {
      if (provider) goTo(2);
      return;
    }

    if (step === 2 && booking) {
      const errors = {
        time: booking.time ? undefined : "Select a time slot.",
        reason: booking.reason ? undefined : "Select a reason for your visit.",
      };
      setBookingErrors(errors);
      if (errors.time || errors.reason) return;
      goTo(3);
    }
  };

  return (
    <div className="flex min-h-full min-w-0 w-full flex-col">
      <div className={`mx-auto w-full max-w-[1600px] min-w-0 flex-1 space-y-4 sm:space-y-5 ${step === 3 ? "flex flex-col" : ""}`}>
        <AddSteps steps={STEPS} current={step} onStepClick={handleStepClick} />

        {step === 1 && (
          <FindProvider
            onBook={handleBook}
            selectedProviderId={provider?.id}
          />
        )}

        {step === 2 && provider && booking && (
          <BookAppointment
            provider={provider}
            booking={booking}
            errors={bookingErrors}
            onChange={(patch) => {
              setBooking((current) => (current ? { ...current, ...patch } : current));
              setBookingErrors((current) => ({
                ...current,
                ...(patch.time !== undefined ? { time: undefined } : {}),
                ...(patch.reason !== undefined ? { reason: undefined } : {}),
              }));
            }}
          />
        )}

        {maxStep >= 3 && provider && booking && (
          <div className={step === 3 ? "flex flex-1 flex-col" : "hidden"}>
            <IntakePayment
              key={provider.id}
              provider={provider}
              booking={booking}
              onBack={() => goTo(2)}
              onComplete={() => router.push(APPOINTMENTS_ROUTE)}
            />
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="sticky -bottom-4 z-[200] -mx-4 -mb-4 mt-4 border-t border-border bg-card px-4 py-4 sm:-bottom-6 sm:-mb-6 sm:-mx-6 sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 sm:justify-end sm:gap-3">
            {step > 1 && (
              <ImportButton
                text="Back to Providers"
                icon={null}
                onClick={handleBack}
                className="shrink-0 whitespace-nowrap px-3 sm:px-5"
              />
            )}
            <AddButton
              text={step === 1 ? "Next: Book an Appointment" : "Next: Intake & Payment"}
              ariaLabel={step === 1 ? "Next: Book an Appointment" : "Next: Intake & Payment"}
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
              disabled={step === 1 && !provider}
              className="shrink-0 whitespace-nowrap px-3 sm:px-5"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindProviderMainPage;