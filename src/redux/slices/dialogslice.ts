import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { QuestionTypeKey, TemplateQuestion } from "@/Questionnaires/template/Addtemplateques";
import type { MembershipPlan } from "@/billing/membership/membership-plans/Viewmembershipplan";
import type { InvoiceItem } from "@/billing/manage/invoice/createinvoice/AddCustomItem";
import type { DeletablePaymentMethod } from "@/billing/manage/payment-method/DeletePaymentMethod";
import type { ClearinghouseAccount } from "@/billing/clearinghouse/clearingaccount/ClearinghouseAccounts";
import type { TestResult } from "@/billing/clearinghouse/clearingaccount/TestConnection";
import type { CatalogMedication } from "@/prescriptions/addprescription/SelectMedicationlistModal";
import type { PatientDetail } from "@/types/patient";

export type IntegrationInfoKind =
  | "documentation" | "setup-guide" | "mapping-data" | "order-preview" | "sample-results" | "status-list";

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
  templateQuestionModal: { question: TemplateQuestion | null; initialType: QuestionTypeKey } | null;
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
  EditProviderOverview: boolean;
  providerOverviewSection:
    | "Personal Information" | "Professional Information" | "Contact Information"
    | "Practice Information" | "Profile Photo & Signature" | null;
  SelectImagingPatient: boolean;
  imagingPatientSelection: PatientDetail | null;
  IntegrationInfo: boolean;
  integrationInfoKind: IntegrationInfoKind | null;
  /** Catalog medication picked in the prescription "Select Medication" modal. */
  medicationTarget: CatalogMedication | null;
  AddDocument: boolean;
  SelectMedication: boolean;
  TestPaymentGatewayConnection: boolean;
  EditPaymentGatewayFees: boolean;
  paymentGatewayFees: Record<"card" | "ach" | "apple" | "google", string>;
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
  EditProviderOverview: false,
  providerOverviewSection: null,
  SelectImagingPatient: false,
  imagingPatientSelection: null,
  IntegrationInfo: false,
  integrationInfoKind: null,
  medicationTarget: null,
  AddDocument: false,
  SelectMedication: false,
  TestPaymentGatewayConnection: false,
  EditPaymentGatewayFees: false,
  paymentGatewayFees: {
    card: "2.9% + $0.30",
    ach: "1% (max $10)",
    apple: "2.9% + $0.30",
    google: "2.9% + $0.30",
  },
};

// Only boolean keys can be toggled with showModal / hideModal
type OnlyBooleanKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T];

export type ModalKey = Exclude<OnlyBooleanKeys<ModalState>, "unlockPopupConfirmed">;

type StateKey = keyof ModalState;

/** Extra state fields that get reset to their initial value when a given modal is hidden. */
const resetOnHide: Partial<Record<ModalKey, StateKey[]>> = {
  UnlockPopup: ["unlockPopupConfirmed"],
  EditProviderOverview: ["providerOverviewSection"],
  SelectImagingPatient: ["imagingPatientSelection"],
  IntegrationInfo: ["integrationInfoKind"],
  DeletePrescription: ["deletePrescriptionTarget"],
  DeleteLicense: ["licenseDeleteTarget"],
  ViewMembershipPlan: ["membershipPlanTarget"],
  DeleteMembershipPlan: ["membershipPlanTarget"],
  AddCustomInvoiceItem: ["customInvoiceItem", "customInvoiceItemDefaultDate"],
  DeleteCustomInvoiceItem: ["customInvoiceItemDeleteTarget"],
  DeletePaymentMethod: ["paymentMethodDeleteTarget", "paymentMethodDeleteIsDefault"],
  TestConnection: ["clearinghouseTestResult"],
  DeleteClearinghouseAccount: ["clearinghouseAccountDeleteTarget"],
  AssignQuestionnaire: ["assignQuestionnaireId"],
  AddTemplateQuestion: ["templateQuestionModal"],
  SelectMedication: ["medicationTarget"],
};

const reset = (state: ModalState, keys: StateKey[]) =>
  Object.assign(state, Object.fromEntries(keys.map((k) => [k, initialState[k]])));

const addUnique = (list: string[], id: string) => {
  if (!list.includes(id)) list.push(id);
};

const dialogSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    showModal: (state, { payload }: PayloadAction<ModalKey>) => {
      state[payload] = true;
      if (payload === "UnlockPopup") state.unlockPopupConfirmed = false;
    },
    hideModal: (state, { payload }: PayloadAction<ModalKey>) => {
      state[payload] = false;
      reset(state, resetOnHide[payload] ?? []);
    },
    hideAllModals: (state) => {
      // Everything goes back to its initial value except the "deleted" history and the gateway fees.
      const { deletedPrescriptionIds, deletedLicenseIds, deletedMembershipPlanIds, paymentGatewayFees } = state;
      Object.assign(state, initialState, {
        deletedPrescriptionIds,
        deletedLicenseIds,
        deletedMembershipPlanIds,
        paymentGatewayFees,
      });
    },

    showProviderOverviewEdit: (state, { payload }: PayloadAction<NonNullable<ModalState["providerOverviewSection"]>>) => {
      Object.assign(state, { providerOverviewSection: payload, EditProviderOverview: true });
    },
    imagingPatientSelected: (state, { payload }: PayloadAction<PatientDetail>) => {
      Object.assign(state, { imagingPatientSelection: payload, SelectImagingPatient: false });
    },
    clearImagingPatientSelection: (state) => {
      state.imagingPatientSelection = null;
    },
    showIntegrationInfo: (state, { payload }: PayloadAction<IntegrationInfoKind>) => {
      Object.assign(state, { integrationInfoKind: payload, IntegrationInfo: true });
    },
    savePaymentGatewayFees: (state, { payload }: PayloadAction<ModalState["paymentGatewayFees"]>) => {
      Object.assign(state, { paymentGatewayFees: payload, EditPaymentGatewayFees: false });
    },

    // Prescriptions
    showDeletePrescription: (state, { payload }: PayloadAction<PrescriptionToDelete>) => {
      Object.assign(state, { deletePrescriptionTarget: payload, DeletePrescription: true });
    },
    prescriptionDeleted: (state, { payload }: PayloadAction<string>) => {
      addUnique(state.deletedPrescriptionIds, payload);
    },
    selectMedication: (state, { payload }: PayloadAction<CatalogMedication>) => {
      Object.assign(state, { medicationTarget: payload, SelectMedication: false });
    },

    // Licenses
    showDeleteLicense: (state, { payload }: PayloadAction<LicenseToDelete>) => {
      Object.assign(state, { licenseDeleteTarget: payload, DeleteLicense: true });
    },
    licenseDeleted: (state, { payload }: PayloadAction<string>) => {
      addUnique(state.deletedLicenseIds, payload);
      Object.assign(state, { licenseDeleteTarget: null, DeleteLicense: false });
    },

    // Membership plans
    showMembershipPlanView: (state, { payload }: PayloadAction<MembershipPlan>) => {
      Object.assign(state, { membershipPlanTarget: payload, DeleteMembershipPlan: false, ViewMembershipPlan: true });
    },
    showMembershipPlanDelete: (state, { payload }: PayloadAction<MembershipPlan>) => {
      Object.assign(state, { membershipPlanTarget: payload, ViewMembershipPlan: false, DeleteMembershipPlan: true });
    },
    selectMembershipPlanForEdit: (state, { payload }: PayloadAction<MembershipPlan>) => {
      Object.assign(state, { membershipPlanTarget: payload, ViewMembershipPlan: false, DeleteMembershipPlan: false });
    },
    membershipPlanDeleted: (state, { payload }: PayloadAction<string>) => {
      addUnique(state.deletedMembershipPlanIds, payload);
      Object.assign(state, { membershipPlanTarget: null, DeleteMembershipPlan: false });
    },

    // Custom invoice items
    showAddCustomInvoiceItem: (state, { payload }: PayloadAction<{ item?: InvoiceItem | null; defaultDate?: string }>) => {
      Object.assign(state, {
        customInvoiceItem: payload.item ?? null,
        customInvoiceItemDefaultDate: payload.defaultDate ?? "",
        AddCustomInvoiceItem: true,
      });
    },
    customInvoiceItemSaved: (state, { payload }: PayloadAction<InvoiceItem>) => {
      Object.assign(state, {
        customInvoiceItemResult: payload,
        AddCustomInvoiceItem: false,
        customInvoiceItem: null,
        customInvoiceItemDefaultDate: "",
      });
    },
    clearCustomInvoiceItemResult: (state) => {
      state.customInvoiceItemResult = null;
    },
    showDeleteCustomInvoiceItem: (state, { payload }: PayloadAction<InvoiceItem>) => {
      Object.assign(state, { customInvoiceItemDeleteTarget: payload, DeleteCustomInvoiceItem: true });
    },
    customInvoiceItemDeleted: (state, { payload }: PayloadAction<string>) => {
      Object.assign(state, {
        customInvoiceItemDeletedId: payload,
        customInvoiceItemDeleteTarget: null,
        DeleteCustomInvoiceItem: false,
      });
    },
    clearCustomInvoiceItemDeletedId: (state) => {
      state.customInvoiceItemDeletedId = null;
    },

    // Payment methods
    showDeletePaymentMethod: (state, { payload }: PayloadAction<{ method: DeletablePaymentMethod; isDefault: boolean }>) => {
      Object.assign(state, {
        paymentMethodDeleteTarget: payload.method,
        paymentMethodDeleteIsDefault: payload.isDefault,
        DeletePaymentMethod: true,
      });
    },
    paymentMethodDeleted: (state, { payload }: PayloadAction<string>) => {
      Object.assign(state, {
        deletedPaymentMethodId: payload,
        paymentMethodDeleteTarget: null,
        paymentMethodDeleteIsDefault: false,
        DeletePaymentMethod: false,
      });
    },
    clearDeletedPaymentMethodId: (state) => {
      state.deletedPaymentMethodId = null;
    },

    // Clearinghouse
    showTestConnection: (state, { payload }: PayloadAction<TestResult>) => {
      Object.assign(state, { clearinghouseTestResult: payload, TestConnection: true });
    },
    showDeleteClearinghouseAccount: (state, { payload }: PayloadAction<ClearinghouseAccount>) => {
      Object.assign(state, { clearinghouseAccountDeleteTarget: payload, DeleteClearinghouseAccount: true });
    },
    clearinghouseAccountDeleted: (state, { payload }: PayloadAction<string>) => {
      Object.assign(state, {
        deletedClearinghouseAccountId: payload,
        clearinghouseAccountDeleteTarget: null,
        DeleteClearinghouseAccount: false,
      });
    },
    clearDeletedClearinghouseAccountId: (state) => {
      state.deletedClearinghouseAccountId = null;
    },

    // Questionnaires
    /** Open the assign modal, optionally preselecting a questionnaire id. */
    showAssignQuestionnaire: {
      reducer: (state, { payload }: PayloadAction<string | null>) => {
        Object.assign(state, { assignQuestionnaireId: payload, AssignQuestionnaire: true });
      },
      prepare: (questionnaireId?: string) => ({ payload: questionnaireId ?? null }),
    },
    showAddTemplateQuestion: (
      state,
      { payload }: PayloadAction<{ question?: TemplateQuestion | null; initialType?: QuestionTypeKey }>,
    ) => {
      Object.assign(state, {
        templateQuestionModal: { question: payload.question ?? null, initialType: payload.initialType ?? "short" },
        templateQuestionResult: null,
        AddTemplateQuestion: true,
      });
    },
    templateQuestionSaved: (state, { payload }: PayloadAction<TemplateQuestion>) => {
      Object.assign(state, { templateQuestionResult: payload, AddTemplateQuestion: false, templateQuestionModal: null });
    },
    clearTemplateQuestionResult: (state) => {
      state.templateQuestionResult = null;
    },

    // Unlock popup
    confirmUnlockPopup: (state) => {
      Object.assign(state, { UnlockPopup: false, unlockPopupConfirmed: true });
    },
    clearUnlockPopupConfirmation: (state) => {
      state.unlockPopupConfirmed = false;
    },
  },
});

export const {
  showModal,
  showProviderOverviewEdit,
  imagingPatientSelected,
  clearImagingPatientSelection,
  showIntegrationInfo,
  savePaymentGatewayFees,
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