import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/GlobalComponents/Sidebar";
import { DashboardHeader } from "../components/GlobalComponents/DashboardHeader";

export const AdminDashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative min-h-screen bg-[#FEF5DC] overflow-x-hidden">
      {/* Top Header Controls */}
      <DashboardHeader />

      {/* Sidebar logic extracted to component */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} role="admin" />

      {/* Main Content Area - Variable margin on MD screens following Gmail style */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-[80px]"}`}>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
