"use client";

import React from "react";

import AddMedicalConditionModal from "@/patient/viewpatients/medicalhistory/Addmedicalconditionmodal";
import AddFamilyHistoryModal from "@/patient/viewpatients/medicalhistory/Addfamilyhistorymodal";
import AddImmunizationModal from "@/patient/viewpatients/medicalhistory/Addimmunizationmodal";
import AddSurgeryModal from "@/patient/viewpatients/medicalhistory/Addsurgerymodal";
import DeletePrescription from "@/prescriptions/Deleteprescription";
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
import UnlockPopup from "@/administration/Unlockpopup";
import DisconnectIntegration from "@/integration/DisconnectIntegration";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import {
  hideModal,
  confirmUnlockPopup,
  prescriptionDeleted,
  templateQuestionSaved,
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
  const addTemplateQuestionOpen = useAppSelector((state) => state.dialog.AddTemplateQuestion);
  const templateQuestionModal = useAppSelector((state) => state.dialog.templateQuestionModal);
  const unlockPopupOpen = useAppSelector((state) => state.dialog.UnlockPopup);
  const cancelAppointmentOpen = useAppSelector((state) => state.dialog.CancelAppointment);
  const declineRequestOpen = useAppSelector((state) => state.dialog.DeclineRequest);
  const markNoShowOpen = useAppSelector((state) => state.dialog.MarkNoShow);
  const disconnectIntegrationOpen = useAppSelector((state) => state.dialog.DisconnectIntegration);

  return (
    <>
      <AddMedicalConditionModal />
      <AddFamilyHistoryModal />
      <AddImmunizationModal />
      <AddSurgeryModal />
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
    </>
  );
};

export default DialogsContainer;
