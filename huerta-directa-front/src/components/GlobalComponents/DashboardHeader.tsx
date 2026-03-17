
import { ProfileMenu } from "./ProfileMenu";



export const DashboardHeader = ({
  showProfile = true,
}) => {
  return (
    <div className="fixed top-5 right-5 md:right-8 z-[1030] flex items-center gap-4 transition-opacity duration-300 dashboard-header">
      {showProfile && <ProfileMenu />}
    </div>
  );
};
