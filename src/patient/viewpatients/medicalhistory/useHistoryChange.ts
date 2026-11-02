import { useState } from "react";
import { useAppDispatch } from "@/hooks/useAppHooks";
import {
  changeMedicalHistory,
  type ChangeMedicalHistoryRequest,
} from "@/redux/thunks/patientRecordsThunks";

/**
 * Save state shared by the Medical History modals: runs one change, and on failure keeps the
 * API message and its per-field errors (keyed by API field name) for the form to show.
 */
export function useHistoryChange() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Resolves to true when the change was saved. */
  const save = async (request: ChangeMedicalHistoryRequest): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    setFieldErrors({});
    const result = await dispatch(changeMedicalHistory(request));
    setIsSaving(false);
    if (changeMedicalHistory.fulfilled.match(result)) return true;
    setSaveError(result.payload?.message ?? "The change could not be saved.");
    setFieldErrors(result.payload?.fieldErrors ?? {});
    return false;
  };

  return { save, isSaving, saveError, fieldErrors };
}
