import React from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import DashboardAdminDesktop from "../../components/DashboardAdmin/DashboardAdminDesktop";
import { DashboardAdminMobile } from "../../components/DashboardAdmin/DashboardAdminMobile";

export const DashboardAdmin: React.FC = () => {
  usePageTitle("Admin Dashboard");

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <DashboardAdminMobile />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DashboardAdminDesktop />
      </div>
    </>
  );
};

export default DashboardAdmin;
