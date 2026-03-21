import { useEffect, useState } from "react";
import authService from "../../services/authService";
import type { User } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export const UserInfo = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sesión al cargar el componente
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Verificar sesión en el servidor
      const sessionData = await authService.checkSession();
      if (!sessionData) {
        // Si no hay sesión en el servidor, limpiar localStorage
        handleLogout();
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      setUser(null);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleName = (idRole: number | null): string => {
    if (idRole === 1) return "Administrador";
    if (idRole === 2) return "Cliente";
    return "Usuario";
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-full shadow-md">
      <div className="flex flex-col text-right">
        <span className="text-sm font-semibold text-gray-800">{user.name}</span>
        <span className="text-xs text-gray-600">{getRoleName(user.idRole)}</span>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </div>
  );
};
