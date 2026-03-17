import React from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChartLine,
  faChartPie,
  faEnvelope,
  faFileLines,
  faUsers,
  faBoxesStacked,
  faFileContract,
  faGear,
  faUserPlus,
  faRightFromBracket,
  faBars,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo_huerta.png";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  role?: "producer" | "admin";
}

const ProducerSidebarContent: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const options = [
    { label: "Dashboard", icon: faHouse, link: "/dashboard" },
    { label: "Mis Favoritos", icon: faHeart, link: "/misFavoritos" },
    { label: "Gráficos", icon: faChartLine, link: "/DashBoardGraficos" },
    { label: "Área Social", icon: faEnvelope, link: "/MensajesAreaSocial" },
    { label: "Ordenes", icon: faFileLines, link: "/misOrdenes" },
    { label: "Agregar Producto", icon: faBoxesStacked, link: "/DashBoardAgregarProducto" },
    { label: "Mi Perfil", icon: faGear, link: "/actualizacionUsuario" },
    { label: "Pagina Principal", icon: faRightFromBracket, link: "/HomePage" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-1040 shadow-xl transition-all duration-300 ease-in-out flex flex-col group/sidebar overflow-hidden
      bg-white dark:bg-[#1A221C]
      ${
        isOpen
          ? "w-70 translate-x-0"
          : "w-70 -translate-x-full md:w-20 md:translate-x-0 md:hover:w-70"
      }`}
    >
      <div
        className={`flex items-center gap-4 px-4 h-20 transition-all ${
          !isOpen && "md:group-hover/sidebar:justify-start md:justify-center"
        }`}
      >
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full 
          hover:bg-gray-100 dark:hover:bg-[#111712]
          transition-colors text-gray-500 dark:text-gray-300 
          text-xl cursor-pointer border-none bg-transparent shrink-0"
          onClick={onToggle}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div
          className={`flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isOpen
              ? "opacity-100 w-auto"
              : "opacity-0 w-0 md:group-hover/sidebar:opacity-100 md:group-hover/sidebar:w-auto"
          }`}
        >
          <img src={logo} alt="Logo" className="w-8 h-8 shrink-0" />
          <h2 className="text-lg font-black text-gray-800 dark:text-white">
            Huerta<span className="text-[#8dc84b]">Directa</span>
          </h2>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {options.map((opt, idx) => {
          const isActive = location.pathname === opt.link;

          return (
            <a
              key={idx}
              href={opt.link}
              className={`flex items-center transition-all h-12 rounded-full px-4 relative group/item overflow-hidden whitespace-nowrap
              
              ${
                isActive
                  ? "bg-[#e8f5e9] dark:bg-[#1f2a22] text-[#2e7d32] dark:text-[#8dc84b] font-bold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#111712]"
              }

              ${!isOpen ? "md:justify-start md:px-4 md:w-full mx-auto" : ""}
              
              `}
              title={!isOpen ? opt.label : ""}
            >
              <div
                className={`flex items-center justify-center w-6 shrink-0 transition-all ${
                  !isOpen && "md:ml-1"
                }`}
              >
                <FontAwesomeIcon
                  icon={opt.icon}
                  className={`text-xl ${
                    isActive
                      ? "text-[#8dc84b]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </div>

              <span
                className={`ml-5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 md:group-hover/sidebar:opacity-100 md:group-hover/sidebar:translate-x-0"
                }`}
              >
                {opt.label}
              </span>

              {!isOpen && (
                <div className="absolute left-16 bg-gray-800 dark:bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover/item:opacity-100 md:group-hover/sidebar:hidden pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {opt.label}
                </div>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

// --- Admin Sidebar Content ---
const AdminSidebarContent: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const options = [
    { label: "Admin Dashboard", icon: faHouse, link: "/admin-dashboard" },
    { label: "Estadísticas Globales", icon: faChartPie, link: "/admin/stats" },
    { label: "Gestión de Usuarios", icon: faUsers, link: "/admin/usuarios" },
    { label: "Gestión de Productos", icon: faBoxesStacked, link: "/admin/productos" },
    { label: "Reportes de Ventas", icon: faFileContract, link: "/admin/reportes" },
    { label: "Configuración", icon: faGear, link: "/admin/config" },
    { label: "Registrar Admin", icon: faUserPlus, link: "/admin/registrar" },
    { label: "Pagina Principal", icon: faRightFromBracket, link: "/HomePage" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#fcfdf2] z-1040 shadow-2xl transition-all duration-300 ease-in-out flex flex-col group/sidebar overflow-hidden border-r border-[#e6e9d2] ${
        isOpen 
          ? "w-70 translate-x-0" 
          : "w-70 -translate-x-full md:w-20 md:translate-x-0 md:hover:w-70"
      }`}
    >
      <div className={`flex items-center gap-4 px-4 h-20 transition-all ${!isOpen && "md:group-hover/sidebar:justify-start md:justify-center"}`}>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eff1db] transition-colors text-gray-500 text-xl cursor-pointer border-none bg-transparent shrink-0"
          onClick={onToggle}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className={`flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${
          isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:group-hover/sidebar:opacity-100 md:group-hover/sidebar:w-auto"
        }`}>
          <img src={logo} alt="Logo" className="w-8 h-8 shrink-0" />
          <h2 className="text-lg font-black text-[#004d00]">
            Huerta<span className="text-[#8dc84b]">Admin</span>
          </h2>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {options.map((opt, idx) => {
          const isActive = location.pathname === opt.link;
          return (
            <a
              key={idx}
              href={opt.link}
              className={`flex items-center transition-all h-12 rounded-full px-4 relative group/item overflow-hidden whitespace-nowrap ${
                isActive ? "bg-[#e8f5e9] text-[#004d00] font-bold" : "text-gray-600 hover:bg-[#f3f5e3]"
              } ${!isOpen ? "md:justify-start md:px-4 md:w-full mx-auto" : ""}`}
              title={!isOpen ? opt.label : ""}
            >
              <div className={`flex items-center justify-center w-6 shrink-0 transition-all ${!isOpen && "md:ml-1"}`}>
                <FontAwesomeIcon icon={opt.icon} className={`text-xl ${isActive ? "text-[#004d00]" : "text-gray-500"}`} />
              </div>
              <span className={`ml-5 text-sm font-medium tracking-wide transition-all duration-300 ${
                isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 md:group-hover/sidebar:opacity-100 md:group-hover/sidebar:translate-x-0"
              }`}>
                {opt.label}
              </span>
              {!isOpen && (
                <div className="absolute left-16 bg-[#004d00] text-white text-xs py-1 px-2 rounded opacity-0 group-hover/item:opacity-100 md:group-hover/sidebar:hidden pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {opt.label}
                </div>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, role = "producer" }) => {
  return (
    <>
      {/* Overlay for mobile (Shared) */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-999 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onToggle}
      />

      {role === "admin" ? (
        <AdminSidebarContent isOpen={isOpen} onToggle={onToggle} />
      ) : (
        <ProducerSidebarContent isOpen={isOpen} onToggle={onToggle} />
      )}
    </>
  );
};
