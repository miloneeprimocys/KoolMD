"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Monitor, Star, Stethoscope } from "lucide-react";

import AddButton from "@/components/Addbutton";
import Breadcrumb from "@/components/Breadcrumb";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import ProviderOverview from "./Provideroverview";
import ProviderAvailability from "./Provideravailability";
import ProviderLocations from "./Providerlocations";
import ProviderServices, { type Service } from "./Providerservices";

/* ---------------------------------------------------------------- */
/*  Types (shared by the marketplace and every tab)                  */
/* ---------------------------------------------------------------- */
export type ProviderSummary = {
  id: string;
  name: string;
  specialty: string;
  /** shown after the specialty on the profile header, e.g. "Primary Care" */
  subSpecialty?: string;
  city: string;
  rating: number;
  reviews: number;
  telemedicine: boolean;
  nextAvailable: string;
  fee: number;
  currency: "$" | "₹";
};

export type PracticeLocation = {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  email: string;
  primary?: boolean;
};

export type ProviderProfile = ProviderSummary & {
  clinic: string;
  about: string;
  specialties: string[];
  education: { degree: string; school: string };
  certification: { board: string; field: string };
  experience: string;
  practice: { name: string; address: string; phone: string; email: string; website: string };
  followUpFee: number;
  insurance: string[];
  languages: string[];
  locations: PracticeLocation[];
  hours: { day: string; time: string }[];
  amenities: string[];
};

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .replace(/,.*$/, "")
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

/* ---------------------------------------------------------------- */
/*  Static profile details (replace with API data later)             */
/* ---------------------------------------------------------------- */
export const buildProfile = (p: ProviderSummary): ProviderProfile => ({
  ...p,
  clinic: "Sunrise Medical Group",
  about: `${p.name} is a board-certified ${p.specialty} physician with 12+ years of experience in primary care, preventive medicine and chronic disease management. ${p.name} is committed to providing compassionate, patient-centered care for adults of all ages.`,
  specialties: ["Primary Care", "Preventive Medicine", "Diabetes Management", "Hypertension", "Chronic Care Management", "General Health"],
  education: { degree: `MD, ${p.specialty}`, school: "AIIMS, New Delhi" },
  certification: { board: "American Board of", field: p.specialty },
  experience: "12+ Years",
  practice: {
    name: "Sunrise Medical Group",
    address: "301, HealthCare Tower, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 79 4000 1234",
    email: "dr.priya@sunrisemed.com",
    website: "www.sunrisemed.com",
  },
  followUpFee: Math.round((p.fee * 0.75) / 5) * 5,
  insurance: ["Aetna", "Cigna", "UnitedHealthcare", "Self Pay"],
  languages: ["English", "Hindi", "Gujarati"],
  locations: [
    { id: "l1", name: "Sunrise Medical Group", address: "301, HealthCare Tower, Science City Road, Ahmedabad, Gujarat 380060", distance: "12 km • 25 min", phone: "+91 79 4000 1234", email: "reception@sunrisemed.com", primary: true },
    { id: "l2", name: "HealthPlus Clinic", address: "104, Shivalik Business Center, Bodakdev, Ahmedabad, Gujarat 380054", distance: "8 km • 18 min", phone: "+91 79 4890 5678", email: "care@healthplus.com" },
    { id: "l3", name: "CareWell Hospital", address: "12, Gurukul Road, Memnagar, Ahmedabad, Gujarat 380052", distance: "10 km • 22 min", phone: "+91 79 2765 4321", email: "info@carewell.com" },
    { id: "l4", name: "Sunrise Specialty Clinic", address: "A-201, Times Square, Sindhu Bhavan Road, Ahmedabad, Gujarat 380054", distance: "9 km • 20 min", phone: "+91 79 4100 9876", email: "hello@sunrisespecialty.com" },
  ],
  hours: [
    { day: "Monday", time: "9:00 AM – 5:00 PM" },
    { day: "Tuesday", time: "9:00 AM – 5:00 PM" },
    { day: "Wednesday", time: "9:00 AM – 5:00 PM" },
    { day: "Thursday", time: "9:00 AM – 5:00 PM" },
    { day: "Friday", time: "9:00 AM – 5:00 PM" },
    { day: "Saturday", time: "9:00 AM – 1:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  amenities: ["Wheelchair Accessible", "Free Parking", "On-site Pharmacy", "Lab Services", "Elevator Access", "Accepts New Patients"],
});

/* ---------------------------------------------------------------- */
/*  Tabs                                                             */
/* ---------------------------------------------------------------- */
export type ProfileTab = "overview" | "availability" | "locations" | "services";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "availability", label: "Availability" },
  { key: "locations", label: "Locations" },
  { key: "services", label: "Services" },
];

const isProfileTab = (value: string | null): value is ProfileTab =>
  TABS.some((tab) => tab.key === value);

const HeaderInfo = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-body" />
    <div className="min-w-0">
      <p className="text-sm font-medium text-heading">{title}</p>
      <p className="text-xs text-body">{sub}</p>
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/*  Page                                                             */
/* ---------------------------------------------------------------- */
type Props = {
  provider: ProviderSummary;
  initialTab?: ProfileTab;
};

const ViewProviderProfile = ({ provider, initialTab = "overview" }: Props) => {
  const profile = useMemo(() => buildProfile(provider), [provider]);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<ProfileTab>(isProfileTab(tabParam) ? tabParam : initialTab);
  /** service picked with "Book Now" – carried into the booking (Availability) tab */
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    if (isProfileTab(tabParam)) setTab(tabParam);
  }, [tabParam]);

  const selectTab = (nextTab: ProfileTab) => {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`${pathname || "/referral/provider-marketplace/viewprofile"}?${params.toString()}`, { scroll: false });
  };

  const openBooking = (s: Service | null = null) => {
    setService(s);
    selectTab("availability");
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Referrals", href: "/referral/management" },
          { label: "Provider Marketplace", href: "/referral/provider-marketplace" },
          { label: "View Profile" },
          { label: TABS.find((item) => item.key === tab)?.label ?? "Overview" },
        ]}
      />

      {/* Profile header */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary sm:h-32 sm:w-32 sm:text-3xl">
            {initials(profile.name)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-heading sm:text-2xl">{profile.name}, MD</h2>
              <Tags text="Verified Provider" tone="success" />
            </div>
            <p className="mt-1 text-sm text-body">
              {profile.specialty}
              {profile.subSpecialty && (
                <>
                  <span className="mx-2 text-border">|</span>
                  {profile.subSpecialty}
                </>
              )}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-body">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold text-heading">{profile.rating}</span>({profile.reviews} reviews)
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <HeaderInfo icon={MapPin} title={profile.clinic} sub={profile.city} />
              <HeaderInfo icon={Monitor} title="Telemedicine" sub={profile.telemedicine ? "Available" : "Not available"} />
              <HeaderInfo icon={Stethoscope} title="In-Person" sub="Available" />
            </div>
          </div>

          <AddButton
            text="Book Appointment"
            icon={<CalendarDays className="h-4 w-4" />}
            onClick={() => openBooking(null)}
            className="shrink-0 self-start"
          />
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Provider profile sections"
        className="flex gap-4 overflow-x-auto overflow-y-hidden border-b border-border hide-scrollbar sm:gap-6"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => selectTab(t.key)}
            className={`-mb-px shrink-0 cursor-pointer border-b-2 px-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-body hover:text-heading"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
 
      <div role="tabpanel">
        {tab === "overview" && <ProviderOverview profile={profile} />}
        {tab === "availability" && (
          <ProviderAvailability profile={profile} service={service} onCancel={() => selectTab("overview")} />
        )}
        {tab === "locations" && <ProviderLocations profile={profile} onViewAvailability={() => openBooking(null)} />}
        {tab === "services" && <ProviderServices profile={profile} onBook={openBooking} />}
      </div>
    </div>
  );
};

export default ViewProviderProfile;