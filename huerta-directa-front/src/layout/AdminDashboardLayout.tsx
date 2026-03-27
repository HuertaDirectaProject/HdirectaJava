import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/GlobalComponents/Sidebar";
import { DashboardHeader } from "../components/GlobalComponents/DashboardHeader";

export const AdminDashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative min-h-screen overflow-x-hidden transition-colors duration-500 bg-linear-to-b from-[#FEF5DC] via-white to-[#FEF5DC] dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C]">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} role="admin" />
      <main className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-70" : "md:ml-20"}`}>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;