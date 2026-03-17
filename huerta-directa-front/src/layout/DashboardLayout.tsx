import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/GlobalComponents/Sidebar";
import { DashboardHeader } from "../components/GlobalComponents/DashboardHeader";

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative min-h-screen bg-[#FEF5DC] overflow-x-hidden">


      {/* Top Header Controls */}
      <DashboardHeader />

      {/* Sidebar logic extracted to component */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area - Variable margin on MD screens following Gmail style */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-70" : "md:ml-20"}`}>
        <div className="p-4 md:p-8 bg-linear-to-b  dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/12 dark:to-[#1A221C] ">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


export default DashboardLayout;
