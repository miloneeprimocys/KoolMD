import React from "react";

import MainLayout from "../app/Mainlayout";
import Dashboard from "./Dashboard";

const DashboardPage = () => {
  return (
    <MainLayout title="Dashboard">
      <Dashboard />
    </MainLayout>
  );
};

export default DashboardPage;