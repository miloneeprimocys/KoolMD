import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  QuestionTypeKey,
  TemplateQuestion,
} from "@/Questionnaires/template/Addtemplateques";

export interface PrescriptionToDelete {
  id: string;
  patient: string;
  age: number;
  gender: string;
  medication: string;
  prescribedDate: string;
  prescribedBy: string;
}

/** Modal visibility and transient modal state. */
interface ModalState {
  AddMedicalCondition: boolean;
  AddFamilyHistory: boolean;
  AddImmunization: boolean;
  AddSurgery: boolean;
  DeletePrescription: boolean;
  deletePrescriptionTarget: PrescriptionToDelete | null;
  deletedPrescriptionIds: string[];
  AssignQuestionnaire: boolean;
  /** Questionnaire preselected when the assign modal opens (null = default / first one). */
  assignQuestionnaireId: string | null;
  AddTemplateQuestion: boolean;
  UnlockPopup: boolean;
  unlockPopupConfirmed: boolean;
  templateQuestionModal: {
    question: TemplateQuestion | null;
    initialType: QuestionTypeKey;
  } | null;
  templateQuestionResult: TemplateQuestion | null;
  RescheduleAppointment: boolean;
  CancelAppointment: boolean;
  JoinVideoVisit: boolean;
}

const initialState: ModalState = {
  AddMedicalCondition: false,
  AddFamilyHistory: false,
  AddImmunization: false,
  AddSurgery: false,
  DeletePrescription: false,
  deletePrescriptionTarget: null,
  deletedPrescriptionIds: [],
  AssignQuestionnaire: false,
  assignQuestionnaireId: null,
  AddTemplateQuestion: false,
  UnlockPopup: false,
  unlockPopupConfirmed: false,
  templateQuestionModal: null,
  templateQuestionResult: null,
  RescheduleAppointment: false,
  CancelAppointment: false,
  JoinVideoVisit: false,
};

// Only boolean keys can be toggled with showModal / hideModal
type OnlyBooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

export type ModalKey = Exclude<OnlyBooleanKeys<ModalState>, "unlockPopupConfirmed">;

const dialogSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<ModalKey>) => {
      state[action.payload] = true;
      if (action.payload === "UnlockPopup") {
        state.unlockPopupConfirmed = false;
      }
    },
    hideModal: (state, action: PayloadAction<ModalKey>) => {
      state[action.payload] = false;
      if (action.payload === "UnlockPopup") {
        state.unlockPopupConfirmed = false;
      }
      if (action.payload === "DeletePrescription") {
        state.deletePrescriptionTarget = null;
      }
      if (action.payload === "AssignQuestionnaire") {
        state.assignQuestionnaireId = null;
      }
      if (action.payload === "AddTemplateQuestion") {
        state.templateQuestionModal = null;
      }
      if (action.payload === "RescheduleAppointment") {
        state.RescheduleAppointment = false;
      }
    },
    showDeletePrescription: (state, action: PayloadAction<PrescriptionToDelete>) => {
      state.deletePrescriptionTarget = action.payload;
      state.DeletePrescription = true;
    },
    /** Open the assign modal, optionally preselecting a questionnaire id. */
    showAssignQuestionnaire: {
      reducer: (state, action: PayloadAction<string | null>) => {
        state.assignQuestionnaireId = action.payload;
        state.AssignQuestionnaire = true;
      },
      prepare: (questionnaireId?: string) => ({ payload: questionnaireId ?? null }),
    },
    showAddTemplateQuestion: (
      state,
      action: PayloadAction<{
        question?: TemplateQuestion | null;
        initialType?: QuestionTypeKey;
      }>,
    ) => {
      state.templateQuestionModal = {
        question: action.payload.question ?? null,
        initialType: action.payload.initialType ?? "short",
      };
      state.templateQuestionResult = null;
      state.AddTemplateQuestion = true;
    },
    confirmUnlockPopup: (state) => {
      state.UnlockPopup = false;
      state.unlockPopupConfirmed = true;
    },
    clearUnlockPopupConfirmation: (state) => {
      state.unlockPopupConfirmed = false;
    },
    templateQuestionSaved: (state, action: PayloadAction<TemplateQuestion>) => {
      state.templateQuestionResult = action.payload;
      state.AddTemplateQuestion = false;
      state.templateQuestionModal = null;
    },
    clearTemplateQuestionResult: (state) => {
      state.templateQuestionResult = null;
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
      state.AssignQuestionnaire = false;
      state.assignQuestionnaireId = null;
      state.AddTemplateQuestion = false;
      state.UnlockPopup = false;
      state.unlockPopupConfirmed = false;
      state.templateQuestionModal = null;
      state.templateQuestionResult = null;
      state.RescheduleAppointment = false;
      state.CancelAppointment = false;
      state.JoinVideoVisit = false;
    },
  },
});

export const {
  showModal,
  hideModal,
  hideAllModals,
  showDeletePrescription,
  showAssignQuestionnaire,
  showAddTemplateQuestion,
  confirmUnlockPopup,
  clearUnlockPopupConfirmation,
  templateQuestionSaved,
  clearTemplateQuestionResult,
  prescriptionDeleted,
  
} = dialogSlice.actions;
export default dialogSlice.reducer;
