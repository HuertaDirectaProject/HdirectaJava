import { useState, useRef, useEffect } from "react";
import { API_URL } from "../../config/api";
import {
  faUser,
  faRightFromBracket,
  faArrowTurnDown,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo_huerta.png";
import authService from "../../services/authService";
import { Button } from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeToggle } from "./ThemeToggle";

export const ProfileMenu = () => {
  {
    /* para que se vea la sesion  */
  }
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const getProfileImageSrc = (imageUrl: string) => {
    if (!imageUrl) return logo;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `${API_URL}${imageUrl}`;
  };

  useEffect(() => {
    const localSessionUser = authService.getCurrentUser();
    if (localSessionUser) {
      setUserName(localSessionUser.name ?? "");
      setProfileImageUrl(localSessionUser.profileImageUrl ?? "");
      setUserRole(localSessionUser.idRole === 1 ? "Administrador" : "Usuario");
    }

    fetch(`${API_URL}/api/login/current`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No session");
        return res.json();
      })
      .then((data) => {
        setUserName(data.name);
        setProfileImageUrl(data.profileImageUrl ?? "");

        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              name: data.name,
              email: data.email,
              idRole: data.idRole,
              profileImageUrl: data.profileImageUrl ?? currentUser.profileImageUrl,
            })
          );
        }

        if (data.idRole === 1) {
          setUserRole("Administrador");
        } else {
          setUserRole("Usuario");
        }
      })
      .catch(() => {
        console.log("No hay sesión");
      });

    const handleProfilePhotoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ profileImageUrl?: string }>;
      setProfileImageUrl(customEvent.detail?.profileImageUrl ?? "");
    };

    window.addEventListener("profile-photo-updated", handleProfilePhotoUpdated as EventListener);

    return () => {
      window.removeEventListener("profile-photo-updated", handleProfilePhotoUpdated as EventListener);
    };
  }, []);
  {
    /* para que se vea la sesion  */
  }

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/login/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Error cerrando sesión");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón que despliega */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#FEF5DC] px-3 py-2 rounded-xl shadow-md hover:scale-105 transition duration-500 dark:text-white cursor-pointer
          dark:bg-black dark:border dark:border-white/40"
      >
        <img src={getProfileImageSrc(profileImageUrl)} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
        <span className="text-gray-500 text-xl dark:text-white">
          <FontAwesomeIcon icon={faArrowTurnDown} />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-60 bg-[#EBEFE5]/70 dark:bg-[#1A221C]/60 backdrop-blur-md  border border-white/30 p-4 rounded-xl shadow-lg  flex flex-col gap-3 animate-fadeIn z-100">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 border-b border-gray-300 dark:border-gray-600 pb-4">
            <img src={getProfileImageSrc(profileImageUrl)} alt="Profile" className="w-17 h-17 rounded-full object-cover" />
            <b className="text-[15px] text-black dark:text-white ">
              {userName}
            </b>
            <small className="text-[15px] text-gray-800 dark:dark:text-white ">
              {userRole}
            </small>
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-3 border-b border-gray-300 dark:border-gray-600 pb-4">
            <Button
              text="Mi perfil"
              to="/actualizacionUsuario"
              iconRight={faUser}
              className="w-full bg-[#20571b] hover:bg-[#52a54a] rounded-xl py-2"
            />

            <Button
              text="DashBoard"
              to={userRole === "Administrador" ? "/admin-dashboard" : "/dashboard"}
              iconRight={faChartColumn}
              className="w-full bg-[#20571b] hover:bg-[#52a54a] rounded-xl py-2"
            />
          </div>

          {/* Logout */}
          <Button
            text="Cerrar Sesión"
            iconRight={faRightFromBracket}
            onClick={handleLogout}
            className="w-full bg-[#d6031f] hover:bg-[#df707f] rounded-xl py-2"
          />

          {/* Theme */}
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
};
