"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Heart, IndianRupee, MapPin, SlidersHorizontal, Star, Stethoscope, Users } from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import StatCards, { type StatItem } from "@/components/Statcards";
import SearchAndFilter from "@/components/Searchandfilter";
import SignupDropdown from "@/components/SignupDropdown";
import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import { cardCls, toOptions } from "@/providers/Shared";
import ViewProviderProfile, { initials, type ProfileTab, type ProviderSummary } from "./viewprofile/Viewproviderprofile";

/* ---------- Static data (replace with API data later) ---------- */
export const PROVIDERS: ProviderSummary[] = [
  { id: "emily", name: "Dr. Emily Carter", specialty: "Cardiology", city: "San Francisco, CA", rating: 4.9, reviews: 124, telemedicine: true, nextAvailable: "Today", fee: 120, currency: "$" },
  { id: "michael", name: "Dr. Michael Chen", specialty: "Dermatology", city: "San Francisco, CA", rating: 4.8, reviews: 98, telemedicine: true, nextAvailable: "Tomorrow, 10:30 AM", fee: 95, currency: "$" },
  { id: "sarah", name: "Dr. Sarah Williams", specialty: "Orthopedics", city: "Oakland, CA", rating: 4.7, reviews: 86, telemedicine: true, nextAvailable: "Today, 2:00 PM", fee: 110, currency: "$" },
  { id: "james", name: "Dr. James Patel", specialty: "Gastroenterology", city: "San Jose, CA", rating: 4.6, reviews: 74, telemedicine: false, nextAvailable: "Mar 22, 9:00 AM", fee: 100, currency: "$" },
  { id: "aisha", name: "Dr. Aisha Khan", specialty: "Endocrinology", city: "San Francisco, CA", rating: 4.8, reviews: 112, telemedicine: true, nextAvailable: "Today, 4:30 PM", fee: 115, currency: "$" },
  { id: "robert", name: "Dr. Robert Miller", specialty: "Neurology", city: "Berkeley, CA", rating: 4.5, reviews: 67, telemedicine: false, nextAvailable: "Mar 23, 11:00 AM", fee: 130, currency: "$" },
  { id: "neha", name: "Dr. Neha Patel", specialty: "Family Medicine", city: "San Francisco, CA", rating: 4.7, reviews: 91, telemedicine: true, nextAvailable: "This Week, 11:00 AM", fee: 105, currency: "$" },
  { id: "priya", name: "Dr. Priya Sharma", specialty: "Internal Medicine", subSpecialty: "Primary Care", city: "Ahmedabad, Gujarat", rating: 4.8, reviews: 120, telemedicine: true, nextAvailable: "Tomorrow, 9:00 AM", fee: 800, currency: "₹" },
];

const STATS: StatItem[] = [
  { label: "Providers", value: "24", Icon: Users, accent: "primary" },
  { label: "Specialties", value: "8", Icon: Stethoscope, accent: "violet" },
  { label: "Available this week", value: "12", Icon: CalendarDays, accent: "success" },
  { label: "Top provider rating", value: "4.9", Icon: Star, accent: "warning" },
];

const SPECIALTIES = Array.from(new Set(PROVIDERS.map((p) => p.specialty)));
const LOCATIONS = Array.from(new Set(PROVIDERS.map((p) => p.city)));
const TIMES = ["Today", "This Week"];
const TYPES = ["Telemedicine", "In-Person"];

const SORT_OPTIONS = toOptions(["Relevance", "Rating", "Fee: Low to High"]);

/* ---------- Provider card ---------- */
const ProviderCard = ({
  provider: p,
  favorite,
  onFavorite,
  onView,
  onBook,
}: {
  provider: ProviderSummary;
  favorite: boolean;
  onFavorite: () => void;
  onView: () => void;
  onBook: () => void;
}) => (
  <article className={`${cardCls} flex flex-col sm:p-5`}>
    <div className="mb-3 flex min-h-[24px] items-start justify-between gap-2">
      {p.telemedicine ? <Tags text="Telemedicine available" tone="success" /> : <span />}
      <button
        type="button"
        aria-label={favorite ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
        aria-pressed={favorite}
        onClick={onFavorite}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-body transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Heart className={`h-4 w-4 ${favorite ? "fill-danger text-danger" : ""}`} />
      </button>
    </div>

    <div className="flex items-start gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
        {initials(p.name)}
      </span>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-semibold text-heading">{p.name}</h3>
        <p className="text-sm text-body">{p.specialty}</p>
        <p className="flex items-center gap-1.5 text-xs text-body">
          <MapPin className="h-3.5 w-3.5" />
          {p.city}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-body">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-semibold text-heading">{p.rating}</span>({p.reviews} reviews)
        </p>
      </div>
    </div>

    <dl className="mt-4 space-y-2 border-t border-divider pt-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <dt className="flex items-center gap-2 text-body">
          <CalendarDays className="h-4 w-4" />
          Next available
        </dt>
        <dd className="text-right font-semibold text-heading">{p.nextAvailable}</dd>
      </div>
      <div className="flex items-center justify-between gap-3">
        <dt className="flex items-center gap-2 text-body">
          <IndianRupee className="h-4 w-4" />
          Consultation fee
        </dt>
        <dd className="font-semibold text-heading">
          {p.currency}
          {p.fee}
        </dd>
      </div>
    </dl>

    <div className="mt-4 space-y-2">
      <AddButton text="View Profile" onClick={onView} className="!w-full" />
      <ImportButton text="Book Appointment" icon={null} onClick={onBook} className="!w-full" />
    </div>
  </article>
);

/* ---------- Page ---------- */
const ProviderMarketPlace = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [draftSpecialty, setDraftSpecialty] = useState("");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [draftType, setDraftType] = useState("");
  const [sort, setSort] = useState("Relevance");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const providers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = PROVIDERS.filter((p) => {
      if (specialty && p.specialty !== specialty) return false;
      if (location && p.city !== location) return false;
      if (time === "Today" && !p.nextAvailable.startsWith("Today")) return false;
      if (time === "This Week" && !/^(Today|Tomorrow|This Week)/i.test(p.nextAvailable)) return false;
      if (type === "Telemedicine" && !p.telemedicine) return false;
      if (query && !`${p.name} ${p.specialty} ${p.city}`.toLowerCase().includes(query)) return false;
      return true;
    });
    if (sort === "Rating") return [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "Fee: Low to High") return [...list].sort((a, b) => a.fee - b.fee);
    return list;
  }, [search, specialty, location, time, type, sort]);

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <Breadcrumb
        items={[
          { label: "Referrals", href: "/referral/management" },
          { label: "Provider Marketplace" },
        ]}
      />

      <div>
        <h2 className="text-xl font-semibold text-heading sm:text-2xl 2xl:text-3xl">Find a Provider</h2>
        <p className="mt-0.5 text-sm text-body">Discover specialists and manage referral options.</p>
      </div>

      <StatCards stats={STATS} />

      <SearchAndFilter
        placeholder="Search by name, specialty or location..."
        value={search}
        onSearch={setSearch}
        filters={[
          { label: "Specialty", options: SPECIALTIES },
          { label: "Location", options: LOCATIONS },
          { label: "Availability", options: TIMES },
          { label: "Consultation Type", options: TYPES },
        ]}
        selectedFilters={{
          Specialty: draftSpecialty,
          Location: draftLocation,
          Availability: draftTime,
          "Consultation Type": draftType,
        }}
        onFilterChange={(label, option) => {
          if (label === "Specialty") setDraftSpecialty(option);
          else if (label === "Location") setDraftLocation(option);
          else if (label === "Availability") setDraftTime(option);
          else if (label === "Consultation Type") setDraftType(option);
        }}
        showDateRange={false}
        trailingFilterAction={
          <AddButton
            text="Filter"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => {
              setSpecialty(draftSpecialty);
              setLocation(draftLocation);
              setTime(draftTime);
              setType(draftType);
            }}
            className="shrink-0"
          />
        }
      />

      {/* Count + sort */}
      <div className="flex flex-wrap items-center  justify-between gap-3">
        <p className="text-sm font-semibold text-heading">
          {specialty || location || time || type || search.trim() ? providers.length : 24} providers found
        </p>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <span className="shrink-0 text-sm text-body">Sort by</span>
          <SignupDropdown
            name="sort"
            placeholder="Relevance"
            searchable={false}
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            className="w-full sm:w-[220px]"
          />
        </div>
      </div>

      {/* Provider grid */}
      {providers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              favorite={favorites.has(p.id)}
              onFavorite={() => toggleFavorite(p.id)}
              onView={() => router.push(`/referral/provider-marketplace/viewprofile?provider=${encodeURIComponent(p.id)}&tab=overview`)}
              onBook={() => router.push(`/referral/provider-marketplace/viewprofile?provider=${encodeURIComponent(p.id)}&tab=availability`)}
            />
          ))}
        </div>
      ) : (
        <p className={`${cardCls} py-10 text-center text-sm text-body`}>No providers match your filters.</p>
      )}
    </div>
  );
};

export const ProviderMarketplaceProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = PROVIDERS.find((item) => item.id === searchParams.get("provider"));
  const tabParam = searchParams.get("tab");
  const tabs: ProfileTab[] = ["overview", "availability", "locations", "services"];
  const initialTab = tabs.includes(tabParam as ProfileTab) ? (tabParam as ProfileTab) : "overview";

  if (!provider) {
    return (
      <div className={`${cardCls} py-10 text-center`}>
        <p className="text-sm text-body">Provider profile not found.</p>
        <ImportButton text="Back to Marketplace" icon={null} onClick={() => router.push("/referral/provider-marketplace")} className="mt-4" />
      </div>
    );
  }

  return (
    <ViewProviderProfile
      key={provider.id}
      provider={provider}
      initialTab={initialTab}
    />
  );
};

export default ProviderMarketPlace;
