import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  QuestionTypeKey,
  TemplateQuestion,
} from "@/Questionnaires/template/Addtemplateques";
import type { MembershipPlan } from "@/billing/membership/membership-plans/Viewmembershipplan";
import type { InvoiceItem } from "@/billing/manage/invoice/createinvoice/AddCustomItem";
import type { DeletablePaymentMethod } from "@/billing/manage/payment-method/DeletePaymentMethod";
import type { ClearinghouseAccount } from "@/billing/clearinghouse/clearingaccount/ClearinghouseAccounts";
import type { TestResult } from "@/billing/clearinghouse/clearingaccount/TestConnection";
import type { CatalogMedication } from "@/prescriptions/addprescription/SelectMedicationModal";

export interface PrescriptionToDelete {
  id: string;
  patient: string;
  age: number;
  gender: string;
  medication: string;
  prescribedDate: string;
  prescribedBy: string;
}
export interface LicenseToDelete {
  id: string;
  provider: string;
  licenseNumber: string;
  state: string;
  licenseType?: string;
}

/** Modal visibility and transient modal state. */
interface ModalState {
  DeletePrescription: boolean;
  deletePrescriptionTarget: PrescriptionToDelete | null;
  deletedPrescriptionIds: string[];
  DeleteLicense: boolean;
  licenseDeleteTarget: LicenseToDelete | null;
  deletedLicenseIds: string[];
  ViewMembershipPlan: boolean;
  DeleteMembershipPlan: boolean;
  membershipPlanTarget: MembershipPlan | null;
  deletedMembershipPlanIds: string[];
  AddCustomInvoiceItem: boolean;
  customInvoiceItem: InvoiceItem | null;
  customInvoiceItemDefaultDate: string;
  customInvoiceItemResult: InvoiceItem | null;
  DeleteCustomInvoiceItem: boolean;
  customInvoiceItemDeleteTarget: InvoiceItem | null;
  customInvoiceItemDeletedId: string | null;
  DeletePaymentMethod: boolean;
  paymentMethodDeleteTarget: DeletablePaymentMethod | null;
  paymentMethodDeleteIsDefault: boolean;
  deletedPaymentMethodId: string | null;
  TestConnection: boolean;
  clearinghouseTestResult: TestResult | null;
  DeleteClearinghouseAccount: boolean;
  clearinghouseAccountDeleteTarget: ClearinghouseAccount | null;
  deletedClearinghouseAccountId: string | null;
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
  ApproveRequest: boolean;
  DeclineRequest: boolean;
  SuggestAlternativeTime: boolean;
  StartConsultation: boolean;
  SendWaitingRoomMessage: boolean;
  MarkNoShow: boolean;
  DisconnectIntegration: boolean;
  EditContactInformation: boolean;
  /** Catalog medication picked in the prescription "Select Medication" modal. */
  medicationTarget: CatalogMedication | null;
  AddDocument: boolean;
  SelectMedication: boolean;
}

const initialState: ModalState = {
  DeletePrescription: false,
  deletePrescriptionTarget: null,
  deletedPrescriptionIds: [],
  DeleteLicense: false,
  licenseDeleteTarget: null,
  deletedLicenseIds: [],
  ViewMembershipPlan: false,
  DeleteMembershipPlan: false,
  membershipPlanTarget: null,
  deletedMembershipPlanIds: [],
  AddCustomInvoiceItem: false,
  customInvoiceItem: null,
  customInvoiceItemDefaultDate: "",
  customInvoiceItemResult: null,
  DeleteCustomInvoiceItem: false,
  customInvoiceItemDeleteTarget: null,
  customInvoiceItemDeletedId: null,
  DeletePaymentMethod: false,
  paymentMethodDeleteTarget: null,
  paymentMethodDeleteIsDefault: false,
  deletedPaymentMethodId: null,
  TestConnection: false,
  clearinghouseTestResult: null,
  DeleteClearinghouseAccount: false,
  clearinghouseAccountDeleteTarget: null,
  deletedClearinghouseAccountId: null,
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
  ApproveRequest: false,
  DeclineRequest: false,
  SuggestAlternativeTime: false,
  StartConsultation: false,
  SendWaitingRoomMessage: false,
  MarkNoShow: false,
  DisconnectIntegration: false,
  EditContactInformation: false,
  medicationTarget: null,
  AddDocument: false,
  SelectMedication: false,
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
      if (action.payload === "DeleteLicense") {
        state.licenseDeleteTarget = null;
      }
      if (action.payload === "ViewMembershipPlan" || action.payload === "DeleteMembershipPlan") {
        state.membershipPlanTarget = null;
      }
      if (action.payload === "AddCustomInvoiceItem") {
        state.customInvoiceItem = null;
        state.customInvoiceItemDefaultDate = "";
      }
      if (action.payload === "DeleteCustomInvoiceItem") {
        state.customInvoiceItemDeleteTarget = null;
      }
      if (action.payload === "DeletePaymentMethod") {
        state.paymentMethodDeleteTarget = null;
        state.paymentMethodDeleteIsDefault = false;
      }
      if (action.payload === "TestConnection") {
        state.clearinghouseTestResult = null;
      }
      if (action.payload === "DeleteClearinghouseAccount") {
        state.clearinghouseAccountDeleteTarget = null;
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
      if (action.payload === "SelectMedication") {
        state.medicationTarget = null;
      }
    },
    showDeletePrescription: (state, action: PayloadAction<PrescriptionToDelete>) => {
      state.deletePrescriptionTarget = action.payload;
      state.DeletePrescription = true;
    },
    showDeleteLicense: (state, action: PayloadAction<LicenseToDelete>) => {
      state.licenseDeleteTarget = action.payload;
      state.DeleteLicense = true;
    },
    licenseDeleted: (state, action: PayloadAction<string>) => {
      if (!state.deletedLicenseIds.includes(action.payload)) {
        state.deletedLicenseIds.push(action.payload);
      }
      state.licenseDeleteTarget = null;
      state.DeleteLicense = false;
    },
    showMembershipPlanView: (state, action: PayloadAction<MembershipPlan>) => {
      state.membershipPlanTarget = action.payload;
      state.DeleteMembershipPlan = false;
      state.ViewMembershipPlan = true;
    },
    showMembershipPlanDelete: (state, action: PayloadAction<MembershipPlan>) => {
      state.membershipPlanTarget = action.payload;
      state.ViewMembershipPlan = false;
      state.DeleteMembershipPlan = true;
    },
    selectMembershipPlanForEdit: (state, action: PayloadAction<MembershipPlan>) => {
      state.membershipPlanTarget = action.payload;
      state.ViewMembershipPlan = false;
      state.DeleteMembershipPlan = false;
    },
    membershipPlanDeleted: (state, action: PayloadAction<string>) => {
      if (!state.deletedMembershipPlanIds.includes(action.payload)) {
        state.deletedMembershipPlanIds.push(action.payload);
      }
      state.membershipPlanTarget = null;
      state.DeleteMembershipPlan = false;
    },
    showAddCustomInvoiceItem: (
      state,
      action: PayloadAction<{ item?: InvoiceItem | null; defaultDate?: string }>,
    ) => {
      state.customInvoiceItem = action.payload.item ?? null;
      state.customInvoiceItemDefaultDate = action.payload.defaultDate ?? "";
      state.AddCustomInvoiceItem = true;
    },
    customInvoiceItemSaved: (state, action: PayloadAction<InvoiceItem>) => {
      state.customInvoiceItemResult = action.payload;
      state.AddCustomInvoiceItem = false;
      state.customInvoiceItem = null;
      state.customInvoiceItemDefaultDate = "";
    },
    clearCustomInvoiceItemResult: (state) => {
      state.customInvoiceItemResult = null;
    },
    showDeleteCustomInvoiceItem: (state, action: PayloadAction<InvoiceItem>) => {
      state.customInvoiceItemDeleteTarget = action.payload;
      state.DeleteCustomInvoiceItem = true;
    },
    customInvoiceItemDeleted: (state, action: PayloadAction<string>) => {
      state.customInvoiceItemDeletedId = action.payload;
      state.customInvoiceItemDeleteTarget = null;
      state.DeleteCustomInvoiceItem = false;
    },
    clearCustomInvoiceItemDeletedId: (state) => {
      state.customInvoiceItemDeletedId = null;
    },
    showDeletePaymentMethod: (state, action: PayloadAction<{ method: DeletablePaymentMethod; isDefault: boolean }>) => {
      state.paymentMethodDeleteTarget = action.payload.method;
      state.paymentMethodDeleteIsDefault = action.payload.isDefault;
      state.DeletePaymentMethod = true;
    },
    paymentMethodDeleted: (state, action: PayloadAction<string>) => {
      state.deletedPaymentMethodId = action.payload;
      state.paymentMethodDeleteTarget = null;
      state.paymentMethodDeleteIsDefault = false;
      state.DeletePaymentMethod = false;
    },
    clearDeletedPaymentMethodId: (state) => {
      state.deletedPaymentMethodId = null;
    },
    showTestConnection: (state, action: PayloadAction<TestResult>) => {
      state.clearinghouseTestResult = action.payload;
      state.TestConnection = true;
    },
    showDeleteClearinghouseAccount: (state, action: PayloadAction<ClearinghouseAccount>) => {
      state.clearinghouseAccountDeleteTarget = action.payload;
      state.DeleteClearinghouseAccount = true;
    },
    clearinghouseAccountDeleted: (state, action: PayloadAction<string>) => {
      state.deletedClearinghouseAccountId = action.payload;
      state.clearinghouseAccountDeleteTarget = null;
      state.DeleteClearinghouseAccount = false;
    },
    clearDeletedClearinghouseAccountId: (state) => {
      state.deletedClearinghouseAccountId = null;
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
    selectMedication: (state, action: PayloadAction<CatalogMedication>) => {
      state.medicationTarget = action.payload;
      state.SelectMedication = false;
    },
    hideAllModals: (state) => {
      state.DeletePrescription = false;
      state.deletePrescriptionTarget = null;
      state.DeleteLicense = false;
      state.licenseDeleteTarget = null;
      state.ViewMembershipPlan = false;
      state.DeleteMembershipPlan = false;
      state.membershipPlanTarget = null;
      state.AddCustomInvoiceItem = false;
      state.customInvoiceItem = null;
      state.customInvoiceItemDefaultDate = "";
      state.customInvoiceItemResult = null;
      state.DeleteCustomInvoiceItem = false;
      state.customInvoiceItemDeleteTarget = null;
      state.customInvoiceItemDeletedId = null;
      state.DeletePaymentMethod = false;
      state.paymentMethodDeleteTarget = null;
      state.paymentMethodDeleteIsDefault = false;
      state.deletedPaymentMethodId = null;
      state.TestConnection = false;
      state.clearinghouseTestResult = null;
      state.DeleteClearinghouseAccount = false;
      state.clearinghouseAccountDeleteTarget = null;
      state.deletedClearinghouseAccountId = null;
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
      state.ApproveRequest = false;
      state.DeclineRequest = false;
      state.SuggestAlternativeTime = false;
      state.StartConsultation = false;
      state.SendWaitingRoomMessage = false;
      state.MarkNoShow = false;
      state.DisconnectIntegration = false;
      state.EditContactInformation = false;
      state.AddDocument = false;
      state.SelectMedication = false;
      state.medicationTarget = null;
    },
  },
});

export const {
  showModal,
  hideModal,
  hideAllModals,
  showDeletePrescription,
  showDeleteLicense,
  licenseDeleted,
  showMembershipPlanView,
  showMembershipPlanDelete,
  selectMembershipPlanForEdit,
  membershipPlanDeleted,
  showAddCustomInvoiceItem,
  customInvoiceItemSaved,
  clearCustomInvoiceItemResult,
  showDeleteCustomInvoiceItem,
  customInvoiceItemDeleted,
  clearCustomInvoiceItemDeletedId,
  showDeletePaymentMethod,
  paymentMethodDeleted,
  clearDeletedPaymentMethodId,
  showTestConnection,
  showDeleteClearinghouseAccount,
  clearinghouseAccountDeleted,
  clearDeletedClearinghouseAccountId,
  showAssignQuestionnaire,
  showAddTemplateQuestion,
  confirmUnlockPopup,
  clearUnlockPopupConfirmation,
  templateQuestionSaved,
  clearTemplateQuestionResult,
  prescriptionDeleted,
  selectMedication,

} = dialogSlice.actions;
export default dialogSlice.reducer;



