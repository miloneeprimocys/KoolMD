import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PrescriptionToDelete {
  id: string;
  patient: string;
  age: number;
  gender: string;
  medication: string;
  prescribedDate: string;
  prescribedBy: string;
}

/** Modal visibility and transient prescription deletion state. */
interface ModalState {
  AddMedicalCondition: boolean;
  AddFamilyHistory: boolean;
  AddImmunization: boolean;
  AddSurgery: boolean;
  DeletePrescription: boolean;
  deletePrescriptionTarget: PrescriptionToDelete | null;
  deletedPrescriptionIds: string[];
}

const initialState: ModalState = {
  AddMedicalCondition: false,
  AddFamilyHistory: false,
  AddImmunization: false,
  AddSurgery: false,
  DeletePrescription: false,
  deletePrescriptionTarget: null,
  deletedPrescriptionIds: [],
};

// Only boolean keys can be toggled with showModal / hideModal
type OnlyBooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

export type ModalKey = OnlyBooleanKeys<ModalState>;

const dialogSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ModalKey>) => {
      state[action.payload] = true;
    },
    hideModal: (state, action: PayloadAction<ModalKey>) => {
      state[action.payload] = false;
      if (action.payload === "DeletePrescription") {
        state.deletePrescriptionTarget = null;
      }
    },
    showDeletePrescription: (state, action: PayloadAction<PrescriptionToDelete>) => {
      state.deletePrescriptionTarget = action.payload;
      state.DeletePrescription = true;
    },
    prescriptionDeleted: (state, action: PayloadAction<string>) => {
      if (!state.deletedPrescriptionIds.includes(action.payload)) {
        state.deletedPrescriptionIds.push(action.payload);
      }
    },
    hideAllModals: (state) => {
      state.AddMedicalCondition = false;
      state.AddFamilyHistory = false;
      state.AddImmunization = false;
      state.AddSurgery = false;
      state.DeletePrescription = false;
      state.deletePrescriptionTarget = null;
    },
  },
});

export const {
  showModal,
  hideModal,
  hideAllModals,
  showDeletePrescription,
  prescriptionDeleted,
} = dialogSlice.actions;
export default dialogSlice.reducer;