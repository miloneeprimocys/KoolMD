"use client";

import React from "react";
import { BadgeCheck, CalendarDays, Heart, Star } from "lucide-react";

import AddButton from "@/components/Addbutton";
import AddInternalButton from "@/components/AddInternalButton";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import { type Provider } from "./FindProvider";

interface Props {
  provider: Provider;
  compact?: boolean;
  favorite: boolean;
  onFavorite: () => void;
  slot: string;
  onSlot: (slot: string) => void;
  onBook: () => void;
  selected?: boolean;
  actionLabel?: string;
}

const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

const ProviderCard = ({
  provider: p,
  compact = false,
  favorite,
  onFavorite,
  slot,
  onSlot,
  onBook,
  selected = false,
  actionLabel = "Book Appointment",
}: Props) => (
  <article className={`${cardCls} flex min-w-0 flex-col gap-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/10 md:grid md:grid-cols-[140px_minmax(0,1fr)] 2xl:flex 2xl:flex-row 2xl:items-stretch 2xl:gap-5 ${selected ? "ring-2 ring-primary" : ""}`}>
    {/* Photo */}
    <div className="relative flex h-[140px] w-[140px] shrink-0 items-center justify-center self-center rounded-xl bg-gradient-to-br from-primary/15 to-violet/30 text-4xl font-bold text-primary md:self-start 2xl:h-auto 2xl:w-auto 2xl:min-w-[140px] 2xl:aspect-square 2xl:self-stretch 2xl:text-5xl">
      {initials(p.name)}
      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
        className="absolute right-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-card shadow transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Heart className={`h-4 w-4 ${favorite ? "fill-danger text-danger" : "text-heading"}`} />
      </button>
    </div>

    {/* Info */}
    <div className="min-w-0 flex-1 space-y-2">
      <div>
        <h3 className="flex items-center gap-1.5 text-lg font-bold text-heading">
          <span className="truncate">{p.name}</span>
          <BadgeCheck className="h-5 w-5 shrink-0 fill-primary text-on-primary" aria-label="Verified" />
        </h3>
        <p className="text-sm text-body">{p.specialty}</p>
      </div>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-semibold text-heading">{p.rating}</span>
          ({p.reviews} reviews)
        </span>
        <span className="hidden h-3 w-px bg-border sm:block" />
        <span>{p.years}+ years experience</span>
      </p>

      {!compact && <p className="max-w-xl text-xs leading-relaxed text-body sm:text-sm">{p.bio}</p>}

      <div className="flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <Tags key={t} text={t} tone="violet" size="xs" />
        ))}
      </div>
    </div>

    {/* Availability */}
    <div className="w-full shrink-0 space-y-3 border-t border-divider pt-4 md:col-span-2 2xl:col-span-1 2xl:w-[290px] 2xl:border-l 2xl:border-t-0 2xl:pl-5 2xl:pt-0">
      <div className="flex items-start gap-2.5">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-[11px] text-body">Next Available</p>
          <p className="text-sm font-semibold text-heading">{p.nextAvailable}</p>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-2">
          {p.slots.map((s) =>
            slot === s ? (
              <AddButton key={s} text={s} icon={null} onClick={() => onSlot(s)} className="!h-10 !justify-center !px-1 !text-xs" />
            ) : (
              <AddInternalButton
                key={s}
                text={s}
                icon={null}
                onClick={() => onSlot(s)}
                className="!h-10 justify-center !border-border !bg-card !px-1 !text-xs !text-heading hover:!border-primary/40 hover:!bg-primary/10"
              />
            ),
          )}
        </div>
      )}

      <AddButton text={actionLabel} icon={null} onClick={onBook} className="w-full !justify-center whitespace-nowrap" />
    </div>
  </article>
);

export default ProviderCard;