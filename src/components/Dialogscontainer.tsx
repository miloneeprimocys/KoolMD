"use client";

import React from "react";

import DeletePrescription from "@/prescriptions/Deleteprescription";
import DeletePlan from "@/billing/membership/membership-plans/DeletePlan";
import ViewMembershipPlanModal from "@/billing/membership/membership-plans/Viewmembershipplan";
import AddCustomItem from "@/billing/manage/invoice/createinvoice/AddCustomItem";
import DeleteCustomItem from "@/billing/manage/invoice/createinvoice/DeleteCustomItem";
import DeletePaymentMethod from "@/billing/manage/payment-method/DeletePaymentMethod";
import DeleteClearinghouseAccount from "@/billing/clearinghouse/clearingaccount/DeleteClearinghouseAccount";
import TestConnection from "@/billing/clearinghouse/clearingaccount/TestConnection";
import AssignQuestionnaireModal from "@/Questionnaires/Assignquestionnaire";
import AddTemplateQuestionModal from "@/Questionnaires/template/Addtemplateques";
import RescheduleModal from "@/appointments/listview/Reschedulemodal";
import CancelAppointment from "@/appointments/listview/CancelAppointment";
import JoinVideoVisit from "@/appointments/listview/JoinVideoVisit";
import ApproveRequest from "@/appointments/requests/ApproveRequest";
import DeclineRequest from "@/appointments/requests/DeclineRequest";
import SuggestAlternativeTime from "@/appointments/requests/SuggestAlternativeTime";
import StartConsultation from "@/appointments/waitingroom/StartConsultation";
import SendWaitingRoomMessage from "@/appointments/waitingroom/SendMessage";
import MarkNoShow from "@/appointments/waitingroom/MarkNoShow";
import UnlockPopup from "@/administration/chatunlock/Unlockpopup";
import DisconnectIntegration from "@/settings/integration/DisconnectIntegration";
import EditContactInformationModal from "@/patient/viewpatients/overview/EditContactInformationModal";
import AddDocumentModal from "@/prescriptions/viewprescription/AddDocumentModal";
import SelectMedicationModal from "@/prescriptions/addprescription/SelectMedicationModal";
import DeleteLicense from "@/providers/licensemanagement/Deletelicense";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  hideModal,
  confirmUnlockPopup,
  prescriptionDeleted,
  templateQuestionSaved,
  membershipPlanDeleted,
  customInvoiceItemSaved,
  customInvoiceItemDeleted,
  paymentMethodDeleted,
  clearinghouseAccountDeleted,
  selectMedication,
  licenseDeleted,
} from "@/redux/slices/dialogslice";

/**
 * Global dialogs container.
 * Mount ONCE inside the Redux <Provider> (e.g. in your root layout / providers file):
 *
 *   <Provider store={store}>
 *     {children}
 *     <DialogsContainer />
 *   </Provider>
 *
 * Every modal here is opened with dispatch(showModal("<Key>")).
 * Add future modals to this list.
 */
const DialogsContainer = () => {
  const dispatch = useAppDispatch();
  const deletePrescriptionOpen = useAppSelector((state) => state.dialog.DeletePrescription);
  const deletePrescriptionTarget = useAppSelector((state) => state.dialog.deletePrescriptionTarget);
  const deleteLicenseOpen = useAppSelector((state) => state.dialog.DeleteLicense);
  const licenseDeleteTarget = useAppSelector((state) => state.dialog.licenseDeleteTarget);
  const viewMembershipPlanOpen = useAppSelector((state) => state.dialog.ViewMembershipPlan);
  const deleteMembershipPlanOpen = useAppSelector((state) => state.dialog.DeleteMembershipPlan);
  const membershipPlanTarget = useAppSelector((state) => state.dialog.membershipPlanTarget);
  const addCustomInvoiceItemOpen = useAppSelector((state) => state.dialog.AddCustomInvoiceItem);
  const customInvoiceItem = useAppSelector((state) => state.dialog.customInvoiceItem);
  const customInvoiceItemDefaultDate = useAppSelector((state) => state.dialog.customInvoiceItemDefaultDate);
  const deleteCustomInvoiceItemOpen = useAppSelector((state) => state.dialog.DeleteCustomInvoiceItem);
  const customInvoiceItemDeleteTarget = useAppSelector((state) => state.dialog.customInvoiceItemDeleteTarget);
  const deletePaymentMethodOpen = useAppSelector((state) => state.dialog.DeletePaymentMethod);
  const paymentMethodDeleteTarget = useAppSelector((state) => state.dialog.paymentMethodDeleteTarget);
  const paymentMethodDeleteIsDefault = useAppSelector((state) => state.dialog.paymentMethodDeleteIsDefault);
  const testConnectionOpen = useAppSelector((state) => state.dialog.TestConnection);
  const clearinghouseTestResult = useAppSelector((state) => state.dialog.clearinghouseTestResult);
  const deleteClearinghouseAccountOpen = useAppSelector((state) => state.dialog.DeleteClearinghouseAccount);
  const clearinghouseAccountDeleteTarget = useAppSelector((state) => state.dialog.clearinghouseAccountDeleteTarget);
  const addTemplateQuestionOpen = useAppSelector((state) => state.dialog.AddTemplateQuestion);
  const templateQuestionModal = useAppSelector((state) => state.dialog.templateQuestionModal);
  const unlockPopupOpen = useAppSelector((state) => state.dialog.UnlockPopup);
  const cancelAppointmentOpen = useAppSelector((state) => state.dialog.CancelAppointment);
  const declineRequestOpen = useAppSelector((state) => state.dialog.DeclineRequest);
  const markNoShowOpen = useAppSelector((state) => state.dialog.MarkNoShow);
  const disconnectIntegrationOpen = useAppSelector((state) => state.dialog.DisconnectIntegration);
  const addDocumentOpen = useAppSelector((state) => state.dialog.AddDocument);
  const selectMedicationOpen = useAppSelector((state) => state.dialog.SelectMedication);

  return (
    <>
      <AssignQuestionnaireModal />
      <UnlockPopup
        open={unlockPopupOpen}
        onClose={() => dispatch(hideModal("UnlockPopup"))}
        onConfirm={() => dispatch(confirmUnlockPopup())}
      />
      <AddTemplateQuestionModal
        open={addTemplateQuestionOpen}
        question={templateQuestionModal?.question}
        initialType={templateQuestionModal?.initialType}
        newId={() => `q${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`}
        onClose={() => dispatch(hideModal("AddTemplateQuestion"))}
        onSave={(question) => dispatch(templateQuestionSaved(question))}
      />
      <DeletePrescription
        open={deletePrescriptionOpen}
        prescription={deletePrescriptionTarget ?? undefined}
        onClose={() => dispatch(hideModal("DeletePrescription"))}
        onDeleted={(id) => dispatch(prescriptionDeleted(id))}
      />
      <DeleteLicense
        open={deleteLicenseOpen}
        license={licenseDeleteTarget}
        onClose={() => dispatch(hideModal("DeleteLicense"))}
        onDeleted={(id) => dispatch(licenseDeleted(id))}
      />
      <ViewMembershipPlanModal
        open={viewMembershipPlanOpen}
        plan={membershipPlanTarget}
        onClose={() => dispatch(hideModal("ViewMembershipPlan"))}
        onEdit={() => dispatch(hideModal("ViewMembershipPlan"))}
        onToggleStatus={() => dispatch(hideModal("ViewMembershipPlan"))}
      />
      <DeletePlan
        open={deleteMembershipPlanOpen}
        plan={membershipPlanTarget}
        onClose={() => dispatch(hideModal("DeleteMembershipPlan"))}
        onDeleted={(id) => dispatch(membershipPlanDeleted(id))}
      />
      <AddCustomItem
        open={addCustomInvoiceItemOpen}
        item={customInvoiceItem}
        defaultDate={customInvoiceItemDefaultDate}
        onClose={() => dispatch(hideModal("AddCustomInvoiceItem"))}
        onSave={(item) => dispatch(customInvoiceItemSaved(item))}
      />
      <DeleteCustomItem
        open={deleteCustomInvoiceItemOpen}
        item={customInvoiceItemDeleteTarget}
        onClose={() => dispatch(hideModal("DeleteCustomInvoiceItem"))}
        onDeleted={(id) => dispatch(customInvoiceItemDeleted(id))}
      />
      <DeletePaymentMethod
        open={deletePaymentMethodOpen}
        method={paymentMethodDeleteTarget}
        isDefault={paymentMethodDeleteIsDefault}
        onClose={() => dispatch(hideModal("DeletePaymentMethod"))}
        onDeleted={(id) => dispatch(paymentMethodDeleted(id))}
      />
      <TestConnection
        open={testConnectionOpen}
        result={clearinghouseTestResult}
        onClose={() => dispatch(hideModal("TestConnection"))}
      />
      <DeleteClearinghouseAccount
        open={deleteClearinghouseAccountOpen}
        account={clearinghouseAccountDeleteTarget}
        onClose={() => dispatch(hideModal("DeleteClearinghouseAccount"))}
        onDeleted={(id) => dispatch(clearinghouseAccountDeleted(id))}
      />
      <RescheduleModal />
      <CancelAppointment
        open={cancelAppointmentOpen}
        onClose={() => dispatch(hideModal("CancelAppointment"))}
      />
      <JoinVideoVisit />
      <ApproveRequest />
      <DeclineRequest
        open={declineRequestOpen}
        onClose={() => dispatch(hideModal("DeclineRequest"))}
      />
      <SuggestAlternativeTime />
      <StartConsultation />
      <SendWaitingRoomMessage />
      <MarkNoShow open={markNoShowOpen} onClose={() => dispatch(hideModal("MarkNoShow"))} />
      <DisconnectIntegration
        open={disconnectIntegrationOpen}
        onClose={() => dispatch(hideModal("DisconnectIntegration"))}
        onConfirm={() => dispatch(hideModal("DisconnectIntegration"))}
      />
      <EditContactInformationModal />
      <AddDocumentModal
        open={addDocumentOpen}
        onClose={() => dispatch(hideModal("AddDocument"))}
      />
      <SelectMedicationModal
        open={selectMedicationOpen}
        onClose={() => dispatch(hideModal("SelectMedication"))}
        onSelect={(medication) => dispatch(selectMedication(medication))}
      />
    </>
  );
};

export default DialogsContainer;

