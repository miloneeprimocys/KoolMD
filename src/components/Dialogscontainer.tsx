"use client";

import React from "react";

import AddMedicalConditionModal from "@/patient/viewpatients/medicalhistory/Addmedicalconditionmodal";
import AddFamilyHistoryModal from "@/patient/viewpatients/medicalhistory/Addfamilyhistorymodal";
import AddImmunizationModal from "@/patient/viewpatients/medicalhistory/Addimmunizationmodal";
import AddSurgeryModal from "@/patient/viewpatients/medicalhistory/Addsurgerymodal";
import DeletePrescription from "@/prescriptions/Deleteprescription";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppHooks";
import { hideModal, prescriptionDeleted } from "@/redux/slices/dialogslice";

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

  return (
    <>
      <AddMedicalConditionModal />
      <AddFamilyHistoryModal />
      <AddImmunizationModal />
      <AddSurgeryModal />
      <DeletePrescription
        open={deletePrescriptionOpen}
        prescription={deletePrescriptionTarget ?? undefined}
        onClose={() => dispatch(hideModal("DeletePrescription"))}
        onDeleted={(id) => dispatch(prescriptionDeleted(id))}
      />
    </>
  );
};

export default DialogsContainer;