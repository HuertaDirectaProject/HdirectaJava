import React from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import DashboardDesktop from "../../components/Dashboard/DashboardDesktop";
import { DashboardMobile } from "../../components/Dashboard/DashboardMobile";

export const Dashboard: React.FC = () => {
  usePageTitle("Dashboard");

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <DashboardMobile />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DashboardDesktop />
      </div>
    </>
  );
};

export default Dashboard;
