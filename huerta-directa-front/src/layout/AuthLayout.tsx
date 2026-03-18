import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen overflow-hidden overscroll-none bg-[#FEF5DC] dark:bg-[#1A221C] md:flex md:items-center md:justify-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
