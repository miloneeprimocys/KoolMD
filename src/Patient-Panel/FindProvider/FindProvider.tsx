"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import SignupDropdown from "@/components/SignupDropdown";
import { cardCls, toOptions } from "@/providers/Shared";

import ProviderFilters, { EMPTY_FILTERS, type FilterState } from "./ProviderFilters";
import ProviderCard from "./ProviderCard";

/* ---------- Static data (replace with API data later) ---------- */
export type Provider = {
  id: string;
  name: string;
  specialty: string;
  category: string; // matches the Specialty filter
  rating: number;
  reviews: number;
  years: number;
  bio: string;
  tags: string[];
  nextAvailable: string;
  slots: string[];
  defaultSlot: string;
  visit: ("video" | "in-person")[];
  languages: string[];
  insurance: string[];
};

const PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Dr. John Carter",
    specialty: "Internal Medicine",
    category: "Primary Care",
    rating: 4.9,
    reviews: 320,
    years: 12,
    bio: "Expert in preventive care, chronic disease management and adult wellness.",
    tags: ["Hypertension", "Diabetes", "Heart Health"],
    nextAvailable: "Today, Oct 14",
    slots: ["10:30 AM", "11:00 AM", "02:00 PM"],
    defaultSlot: "10:30 AM",
    visit: ["video", "in-person"],
    languages: ["English", "Hindi"],
    insurance: ["Aetna", "Cigna"],
  },
  {
    id: "p2",
    name: "Dr. Emily Turner",
    specialty: "Family Medicine",
    category: "Primary Care",
    rating: 4.8,
    reviews: 210,
    years: 8,
    bio: "Provides comprehensive care for individuals and families across all age groups.",
    tags: ["Family Care", "Preventive Care", "Women's Health"],
    nextAvailable: "Wed, Oct 16",
    slots: ["09:00 AM", "10:30 AM", "01:00 PM"],
    defaultSlot: "10:30 AM",
    visit: ["video"],
    languages: ["English", "Gujarati"],
    insurance: ["Blue Cross Blue Shield", "UnitedHealthcare"],
  },
  {
    id: "p3",
    name: "Dr. Michael Reed",
    specialty: "Cardiology",
    category: "Cardiology",
    rating: 4.7,
    reviews: 180,
    years: 15,
    bio: "Specializes in heart health, risk prevention and cardiac care.",
    tags: ["Heart Disease", "Cholesterol", "Cardiac Risk"],
    nextAvailable: "Thu, Oct 17",
    slots: ["10:00 AM", "11:30 AM", "03:00 PM"],
    defaultSlot: "",
    visit: ["in-person"],
    languages: ["English", "Hindi", "Spanish"],
    insurance: ["Aetna", "UnitedHealthcare"],
  },
];

const SORT_OPTIONS = toOptions(["Recommended", "Highest Rated", "Most Experienced"]);

type View = "detailed" | "compact";

interface FindProviderProps {
  onBook?: (provider: Provider, slot: string) => void;
  selectedProviderId?: string;
}

const FindProvider = ({ onBook, selectedProviderId }: FindProviderProps) => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState("Recommended");
  const [view, setView] = useState<View>("detailed");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<Record<string, string>>(
    Object.fromEntries(PROVIDERS.map((p) => [p.id, p.defaultSlot])),
  );

  const providers = useMemo(() => {
    const list = PROVIDERS.filter((p) => {
      if (filters.specialty.length && !filters.specialty.includes(p.category)) return false;
      if (filters.visit.length && !filters.visit.includes("any") && !p.visit.some((v) => filters.visit.includes(v))) return false;
      if (filters.insurance && !p.insurance.includes(filters.insurance)) return false;
      if (filters.language.length && !filters.language.some((l) => p.languages.includes(l))) return false;
      return true;
    });
    if (sort === "Highest Rated") return [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "Most Experienced") return [...list].sort((a, b) => b.years - a.years);
    return list;
  }, [filters, sort]);

  const patch = (p: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...p }));

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const book = (p: Provider) => {
    const selectedSlot = slots[p.id] ?? "";
    if (onBook) {
      onBook(p, selectedSlot);
      return;
    }

    // TODO: route to your booking page
    router.push(`/book-appointment?provider=${p.id}&slot=${encodeURIComponent(selectedSlot)}`);
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1600px] space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">Find a Provider</h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Search and book an appointment with a healthcare provider that fits your needs.
        </p>
      </div>

      {/* Filters toggle (below xl) */}
      <div className="xl:hidden">
        <ImportButton
          text={showFilters ? "Hide Filters" : "Show Filters"}
          icon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setShowFilters((s) => !s)}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <ProviderFilters
          filters={filters}
          onChange={patch}
          onClear={() => setFilters(EMPTY_FILTERS)}
          className={`${showFilters ? "block" : "hidden"} xl:block`}
        />

        <section className="min-w-0 space-y-4" aria-live="polite">
          {/* Toolbar */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-heading sm:text-lg">{providers.length} Providers Found</h2>

            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-heading sm:inline">Sort by:</span>
                <div className="w-[190px] [&_label]:hidden">
                  <SignupDropdown
                    name="sort"
                    label="Sort by"
                    placeholder="Sort by"
                    searchable={false}
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={(v: string) => setSort(v)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5" role="group" aria-label="Layout">
                {view === "detailed" ? (
                  <AddButton text="" icon={<LayoutGrid className="h-4 w-4" />} onClick={() => setView("detailed")} className="!w-12 !justify-center !gap-0 !px-0" />
                ) : (
                  <ImportButton text="" icon={<LayoutGrid className="h-4 w-4" />} onClick={() => setView("detailed")} className="!w-12 !justify-center !gap-0 !px-0" />
                )}
                {view === "compact" ? (
                  <AddButton text="" icon={<List className="h-4 w-4" />} onClick={() => setView("compact")} className="!w-12 !justify-center !gap-0 !px-0" />
                ) : (
                  <ImportButton text="" icon={<List className="h-4 w-4" />} onClick={() => setView("compact")} className="!w-12 !justify-center !gap-0 !px-0" />
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {providers.length === 0 ? (
            <div className={`${cardCls} py-14 text-center`}>
              <p className="text-sm font-semibold text-heading">No providers match your filters.</p>
              <p className="mt-1 text-xs text-body">Try removing a filter to see more results.</p>
              <div className="mt-4 flex justify-center">
                <ImportButton text="Clear All Filters" icon={null} onClick={() => setFilters(EMPTY_FILTERS)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  compact={view === "compact"}
                  favorite={favorites.has(p.id)}
                  onFavorite={() => toggleFavorite(p.id)}
                  slot={slots[p.id] ?? ""}
                  onSlot={(s) => setSlots((prev) => ({ ...prev, [p.id]: s }))}
                  onBook={() => book(p)}
                  selected={selectedProviderId === p.id}
                  actionLabel={onBook ? (selectedProviderId === p.id ? "Selected" : "Select Provider") : "Book Appointment"}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FindProvider;