import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { CContainer } from "@coreui/react";
import "../styles/DashboardLayout.css"; // Ensure you include this CSS file

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <AppSidebar />

      <div className="dashboard-content">
        <AppHeader />
        <div className="main-content">
          <CContainer fluid className="mt-3">
            <Outlet /> {/* ✅ Ensures correct page loads */}
          </CContainer>
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
