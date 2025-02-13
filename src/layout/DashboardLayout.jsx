import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { CContainer, CRow, CCol } from "@coreui/react";

const DashboardLayout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-grow-1">
        <AppHeader />
        <CContainer fluid className="mt-3">
          <CRow>
            <CCol>
              <Outlet /> {/* ✅ This renders the correct dashboard based on the route */}
            </CCol>
          </CRow>
        </CContainer>
        <AppFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
