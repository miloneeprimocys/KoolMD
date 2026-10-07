import MainLayout from "@/app/Mainlayout";
import AddPatient from "@/patient/AddPatient";

export default function AddPatientPage() {
  return (
    <MainLayout title="Add Patient">
      <AddPatient />
    </MainLayout>
  );
}
