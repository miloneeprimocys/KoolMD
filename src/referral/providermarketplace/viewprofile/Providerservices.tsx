"use client";

import React, { useMemo, useState } from "react";
import {
  Clock,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  MoreHorizontal,
  Monitor,
  Plane,
  ShieldCheck,
  Stethoscope,
  Syringe,
  User,
  UserRound,
  Activity,
  type LucideIcon,
} from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SearchAndFilter from "@/components/Searchandfilter";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import type { ProviderProfile } from "./Viewproviderprofile";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API data later)                        */
/* ---------------------------------------------------------------- */
export type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  price: number;
  icon: LucideIcon;
  popular?: boolean;
};

const ALL = "All Services";

const CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: ALL, icon: LayoutGrid },
  { label: "Primary Care", icon: User },
  { label: "Preventive Care", icon: ShieldCheck },
  { label: "Chronic Disease Management", icon: Activity },
  { label: "Diagnostic Services", icon: FlaskConical },
  { label: "Telemedicine Services", icon: Monitor },
  { label: "Women's Health", icon: HeartPulse },
  { label: "Travel Medicine", icon: Plane },
  { label: "Vaccinations", icon: Syringe },
  { label: "Others", icon: MoreHorizontal },
];

const SERVICES: Service[] = [
  { id: "s1", title: "Initial Consultation", description: "Comprehensive evaluation of your medical history, current health concerns and personalized care plan.", category: "Primary Care", minutes: 30, price: 800, icon: Stethoscope, popular: true },
  { id: "s2", title: "Follow-up Consultation", description: "Review of ongoing treatment, test results and medication management.", category: "Primary Care", minutes: 15, price: 600, icon: UserRound },
  { id: "s3", title: "Annual Physical Exam", description: "Complete health check-up including vital signs, physical examination and preventive care recommendations.", category: "Preventive Care", minutes: 30, price: 800, icon: HeartPulse },
  { id: "s4", title: "Vaccinations", description: "Routine and travel-related vaccinations.", category: "Vaccinations", minutes: 15, price: 400, icon: Syringe },
  { id: "s5", title: "Lab Test Review", description: "Discussion and interpretation of lab test results with treatment plan.", category: "Diagnostic Services", minutes: 20, price: 600, icon: FlaskConical },
  { id: "s6", title: "Telemedicine Consultation", description: "Video consultation for non-urgent medical concerns.", category: "Telemedicine Services", minutes: 15, price: 600, icon: Monitor },
  { id: "s7", title: "Women's Health Consultation", description: "Preventive care, menstrual health, hormonal concerns and general women's health.", category: "Women's Health", minutes: 30, price: 800, icon: HeartPulse },
];

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  profile: ProviderProfile;
  /** "Book Now" → opens the Availability tab with this service */
  onBook: (service: Service) => void;
};

const ProviderServices = ({ profile, onBook }: Props) => {
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(
    () => SERVICES.find((service) => service.popular)?.id ?? "",
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVICES.filter((s) => {
      if (category !== ALL && s.category !== category) return false;
      if (q && !`${s.title} ${s.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, search]);

  return (
    <section className={`${cardCls} sm:p-6`}>
      <div className="mb-5 flex flex-col gap-3 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-heading">Services</h3>
          <p className="mt-0.5 text-xs text-body sm:text-sm">
            {profile.name} provides a range of primary care and internal medicine services. Select a service to learn
            more or book an appointment.
          </p>
        </div>
        <div className="w-full 2xl:w-[380px] 2xl:shrink-0">
          <SearchAndFilter
            placeholder="Search services..."
            value={search}
            onSearch={(v: string) => setSearch(v)}
            filters={[]}
            selectedFilters={{}}
            onFilterChange={() => {}}
            className="!flex-row !items-center"
          />
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[230px_minmax(0,1fr)]">
        {/* Categories */}
        <nav aria-label="Service categories" className="flex gap-2 overflow-x-auto 2xl:flex-col 2xl:gap-1 2xl:overflow-visible 2xl:border-r 2xl:border-divider 2xl:pr-4">
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const active = category === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(label)}
                className={`flex shrink-0 cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 2xl:whitespace-normal ${
                  active ? "bg-primary/10 font-medium text-primary" : "text-heading hover:bg-primary/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Services list */}
        <ul className="min-w-0 space-y-3">
          {visible.length === 0 && (
            <li className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-body">
              No services match your search.
            </li>
          )}
          {visible.map((s) => {
            const selected = selectedServiceId === s.id;
            return (
              <li key={s.id}>
                <div
                  className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4 ${
                    selected
                      ? "border-primary/30 bg-primary/10 hover:border-primary/50 hover:bg-primary/15"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedServiceId(s.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:items-center sm:gap-4"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="h-6 w-6" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-heading">{s.title}</span>
                        {s.popular && <Tags text="Popular" tone="info" />}
                      </span>
                      <span className="mt-1 block text-xs text-body sm:text-sm">{s.description}</span>
                    </span>

                    <span
                      className={`flex shrink-0 items-center gap-5 border-l pl-3 text-sm sm:pl-8 ${
                        selected ? "border-primary/50" : "border-divider"
                      }`}
                    >
                      <span>
                        <span className="flex items-center gap-1.5 text-body">
                          <Clock className="h-3.5 w-3.5" />
                          {s.minutes} minutes
                        </span>
                        <span className="mt-0.5 block font-medium text-heading">
                          {profile.currency}{s.price}
                        </span>
                      </span>
                    </span>
                  </button>

                  {selected ? (
                    <AddButton text="Book Now" icon={null} onClick={() => onBook(s)} className="shrink-0 px-5 sm:ml-4 lg:ml-6" />
                  ) : (
                    <ImportButton text="Book Now" icon={null} onClick={() => onBook(s)} className="shrink-0 px-5 sm:ml-4 lg:ml-6" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ProviderServices;
