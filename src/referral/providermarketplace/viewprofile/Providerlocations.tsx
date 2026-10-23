"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Building2,
  Car,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Mail,
  Maximize2,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import AddButton from "@/components/Addbutton";
import ImportButton from "@/components/ImportButton";
import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import type { ProviderProfile } from "./Viewproviderprofile";

/* ---------------------------------------------------------------- */
/*  Location photo + coordinates                                     */
/*  (replace with `image` / `lat` / `lng` from your API later)       */
/* ---------------------------------------------------------------- */
type LocationMedia = { image?: string; lat?: number; lng?: number };

const LOCATION_MEDIA: Record<string, LocationMedia> = {
  l1: { image: "/images/locations/sunrise-medical-group.jpg", lat: 23.0735, lng: 72.5075 },
  l2: { image: "/images/locations/healthplus-clinic.jpg", lat: 23.0396, lng: 72.516 },
  l3: { image: "/images/locations/carewell-hospital.jpg", lat: 23.0527, lng: 72.5467 },
  l4: { image: "/images/locations/sunrise-specialty-clinic.jpg", lat: 23.046, lng: 72.5063 },
};

/** Photo of the location. Falls back to a building icon when there is no image or it fails to load. */
const LocationImage = ({
  src,
  alt,
  className = "",
  iconClassName = "h-6 w-6",
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}) => {
  const [failed, setFailed] = useState(false);

  /* a different location → try its image again */
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span className={`flex shrink-0 items-center justify-center bg-primary/10 text-primary ${className}`}>
        <Building2 className={iconClassName} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setFailed(true)} className={`shrink-0 object-cover ${className}`} />
  );
};

/* ---------------------------------------------------------------- */
/*  Map (Leaflet + OpenStreetMap tiles)                              */
/*  npm i leaflet && npm i -D @types/leaflet                         */
/* ---------------------------------------------------------------- */
const LocationMap = ({ lat, lng, label }: { lat?: number; lng?: number; label: string }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const hasCoords = typeof lat === "number" && typeof lng === "number";

  /* Create the map once (Leaflet needs `window`, so it is imported on the client only) */
  useEffect(() => {
    if (!hasCoords || !mapElRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapElRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(mapElRef.current, { zoomControl: false, attributionControl: true }).setView([lat!, lng!], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pin = L.divIcon({
        className: "",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7 0 15.7 0 27 16 40 16 40s16-13 16-24.3C32 7 24.8 0 16 0z" fill="#2f4ff0"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>`,
      });

      markerRef.current = L.marker([lat!, lng!], { icon: pin })
        .addTo(map)
        .bindTooltip(label, { permanent: true, direction: "right", offset: [14, -20] });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // created once per mount; location changes are handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords]);

  /* Move the map + pin when another location is selected */
  useEffect(() => {
    if (!hasCoords || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat!, lng!]).setTooltipContent(label);
    mapRef.current.setView([lat!, lng!], 15, { animate: true });
  }, [lat, lng, label, hasCoords]);

  /* Re-measure after entering / leaving full screen */
  useEffect(() => {
    const onChange = () => setTimeout(() => mapRef.current?.invalidateSize(), 100);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen?.();
  };

  if (!hasCoords) {
    return (
      <div className="flex h-full min-h-44 w-full flex-col items-center justify-center gap-1 bg-heading/5 text-center">
        <MapPin className="h-8 w-8 text-primary" />
        <span className="px-2 text-xs text-body">Map unavailable for this location</span>
      </div>
    );
  }

  const ctrl =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-card text-heading shadow-md transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  return (
    <div ref={wrapRef} className="relative isolate z-0 h-full min-h-44 w-full">
      <div ref={mapElRef} className="h-full w-full" />

      <button type="button" aria-label="Full screen map" onClick={toggleFullscreen} className={`${ctrl} absolute right-2 top-2 z-[500]`}>
        <Maximize2 className="h-4 w-4" />
      </button>
      <div className="absolute bottom-6 right-2 z-[500] flex flex-col gap-1.5">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()} className={ctrl}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()} className={ctrl}>
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/*  Component                                                        */
/* ---------------------------------------------------------------- */
type Props = {
  profile: ProviderProfile;
  /** "View Available Appointments" → opens the Availability tab */
  onViewAvailability: () => void;
};

const ProviderLocations = ({ profile, onViewAvailability }: Props) => {
  const [activeId, setActiveId] = useState(profile.locations[0]?.id);
  const active = profile.locations.find((l) => l.id === activeId) ?? profile.locations[0];

  if (!active) {
    return <p className={`${cardCls} text-center text-sm text-body`}>No practice locations available.</p>;
  }

  const media = LOCATION_MEDIA[active.id] ?? {};

  const getDirections = () => {
    const destination =
      typeof media.lat === "number" && typeof media.lng === "number"
        ? `${media.lat},${media.lng}`
        : encodeURIComponent(active.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ================= LEFT: list ================= */}
      <section className={`${cardCls} sm:p-6`}>
        <h3 className="text-lg font-semibold text-heading">Practice Locations</h3>
        <p className="mb-4 mt-0.5 text-xs text-body sm:text-sm">
          {profile.name} sees patients at the following locations. Select a location to view details and availability.
        </p>

        <ul className="space-y-3">
          {profile.locations.map((l) => {
            const selected = l.id === active.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveId(l.id)}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <LocationImage
                    src={LOCATION_MEDIA[l.id]?.image}
                    alt={l.name}
                    className="h-20 w-24 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-heading">{l.name}</p>
                      {l.primary && <Tags text="Primary Location" tone="info" />}
                    </div>
                    <p className="mt-1 text-xs text-body sm:text-sm">{l.address}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-body">
                      <span className="inline-flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-primary" />
                        {l.distance}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {l.phone}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-body" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ================= RIGHT: details ================= */}
      <section className={`${cardCls} overflow-hidden !p-0`}>
        {/* Photo + map */}
        <div className="grid h-44 grid-cols-2 sm:h-56">
          <LocationImage
            src={media.image}
            alt={active.name}
            className="h-full w-full"
            iconClassName="h-12 w-12"
          />
          <LocationMap lat={media.lat} lng={media.lng} label={active.name} />
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-heading">{active.name}</h3>
            {active.primary && <Tags text="Primary Location" tone="info" />}
          </div>

          <p className="flex items-start gap-2.5 text-sm text-heading">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {active.address}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-heading">
            <span className="inline-flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-primary" />
              {active.phone}
            </span>
            <span className="inline-flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary" />
              {active.email}
            </span>
          </div>

          <div className="grid gap-5 rounded-xl border border-border p-4 md:grid-cols-2">
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
                <Clock className="h-4 w-4 text-primary" />
                Office Hours
              </h4>
              <dl className="space-y-1.5">
                {profile.hours.map((h) => (
                  <div key={h.day} className="grid grid-cols-[90px_minmax(0,1fr)] gap-2 text-xs text-body sm:text-sm">
                    <dt>{h.day}</dt>
                    <dd className="text-heading">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="md:border-l md:border-divider md:pl-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
                <Building2 className="h-4 w-4 text-primary" />
                Amenities
              </h4>
              <ul className="space-y-1.5">
                {profile.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-xs text-body sm:text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ImportButton
              text="Get Directions"
              icon={<Navigation className="h-4 w-4" />}
              onClick={getDirections}
              className="!w-full"
            />
            <AddButton
              text="View Available Appointments"
              icon={<CalendarDays className="h-4 w-4" />}
              onClick={onViewAvailability}
              className="!w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProviderLocations;