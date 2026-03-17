import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../../services/authService";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const session = await authService.checkSession();

      if (!isMounted) {
        return;
      }

      setIsAllowed(session !== null);
      setIsAdmin(session?.idRole === 1);
      setIsChecking(false);
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF5DC] text-[#2f3b1f] font-['Poppins']">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#8dc84b] border-t-transparent animate-spin" />
          <p className="font-semibold">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/HomePage" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
