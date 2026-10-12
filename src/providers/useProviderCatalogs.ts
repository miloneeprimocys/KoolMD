import { useEffect, useMemo } from "react";
import type { DropdownOption } from "@/components/SignupDropdown";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  selectOrganizationLocations,
  selectSpecialties,
} from "@/redux/selectors/practitionerSelectors";
import { fetchLocations, fetchSpecialties } from "@/redux/thunks/practitionerThunks";
import { getSubspecialtyOptions } from "./Shared";

/**
 * Specialty catalog from the backend (values are specialty ids). Fetched once per session —
 * any number of components can call this without extra requests.
 */
export function useSpecialtyOptions() {
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialties);

  useEffect(() => {
    dispatch(fetchSpecialties());
  }, [dispatch]);

  const specialtyOptions: DropdownOption[] = useMemo(
    () => specialties.map((specialty) => ({ value: specialty.id, label: specialty.name })),
    [specialties],
  );

  /** Subspecialties are a UI-only list keyed by specialty name (not stored by the backend). */
  const getSubspecialtyOptionsFor = (specialtyId: string) =>
    getSubspecialtyOptions(
      specialties.find((specialty) => specialty.id === specialtyId)?.name ?? "",
    );

  return { specialtyOptions, getSubspecialtyOptionsFor };
}

/** Active organization locations (values are location ids). Fetched once per session. */
export function useLocationOptions() {
  const dispatch = useAppDispatch();
  const locations = useAppSelector(selectOrganizationLocations);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const locationOptions: DropdownOption[] = useMemo(
    () => locations.map((location) => ({ value: location.id, label: location.name })),
    [locations],
  );

  const formatLocationAddress = (locationId: string) => {
    const location = locations.find((candidate) => candidate.id === locationId);
    if (!location) return "";
    if (location.locationType === "VIRTUAL") return "Virtual (telemedicine) location";
    return [
      location.addressLine1,
      location.addressLine2,
      location.city,
      [location.stateCode, location.postalCode].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");
  };

  return { locationOptions, formatLocationAddress };
}
