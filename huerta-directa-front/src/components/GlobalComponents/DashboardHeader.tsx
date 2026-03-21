import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { ProfileMenu } from "./ProfileMenu";

interface DashboardHeaderProps {
  showProfile?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showProfile = true,
  onToggleSidebar,
}) => {
  return (
    <div className="fixed top-5 left-5 right-5 md:right-8 z-[1030] flex items-center justify-between md:justify-end gap-4 transition-opacity duration-300 dashboard-header pointer-events-none">
      {/* Hamburger menu for mobile */}
      <div className="flex md:hidden pointer-events-auto">
        <button
          onClick={onToggleSidebar}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/40 shadow-md text-gray-600 dark:text-white cursor-pointer active:scale-95 transition-transform"
          aria-label="Menu"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        {showProfile && <ProfileMenu />}
      </div>
    </div>
  );
};
