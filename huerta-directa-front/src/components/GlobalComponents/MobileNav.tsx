import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faHome,
  faBox,
  faList,
  faInfoCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { ProfileMenu } from "./ProfileMenu";

interface Props {
  open: boolean;
  onClose: () => void;
  showInicio?: boolean;
  showCategorias?: boolean;
  showProductos?: boolean;
  showQuienesSomos?: boolean;
  showAddProduct?: boolean;
  showProfile?: boolean;
  showCart?: boolean;
}

export const MobileNav = ({
  open,
  onClose,
  showInicio = false,
  showCategorias = false,
  showProductos = false,
  showQuienesSomos = false,
  showAddProduct = false,
  showProfile = false,
}: Props) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition
        ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      {/* PANEL */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-[#1A221C] text-black dark:text-white shadow-2xl z-50 transition-transform duration-500
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b dark:border-white/10">
          <h2 className="font-bold text-lg">Menú</h2>

          <button onClick={onClose}>
            <FontAwesomeIcon
              icon={faCircleXmark}
              className="hover:text-[#78d64b] cursor-pointer transition-all duration-500"
            />
          </button>
        </div>

        {/* PERFIL + CARRITO */}
        <div className="flex justify-end items-center px-5 py-3 border-b dark:border-white/10">
          {showProfile && <ProfileMenu />}
        </div>

        {/* LINKS */}
        <nav className="flex flex-col p-5 gap-5 text-lg">
          {showInicio && (
            <Link
              to="/HomePage"
              onClick={onClose}
              className="flex items-center gap-3 hover:text-[#78d64b] transition-all duration-500 cursor-pointer"
            >
              <FontAwesomeIcon icon={faHome} />
              Inicio
            </Link>
          )}

          {showProductos && (
            <Link
              to="/Productos"
              onClick={onClose}
              className="flex items-center gap-3 hover:text-[#78d64b] transition-all duration-500 cursor-pointer"
            >
              <FontAwesomeIcon icon={faBox} />
              Productos
            </Link>
          )}

          {showCategorias && (
            <Link
              to="/CategoryPage"
              onClick={onClose}
              className="flex items-center gap-3 hover:text-[#78d64b] transition-all duration-500 cursor-pointer"
            >
              <FontAwesomeIcon icon={faList} />
              Categorías
            </Link>
          )}

          {showQuienesSomos && (
            <Link
              to="/QuienesSomos"
              onClick={onClose}
              className="flex items-center gap-3 hover:text-[#78d64b] transition-all duration-500 cursor-pointer"
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Quiénes somos
            </Link>
          )}

          {showAddProduct && (
            <Link
              to="/DashBoardAgregarProducto"
              onClick={onClose}
              className="flex items-center gap-3 bg-[#78d64b] text-white px-4 py-2 rounded-lg hover:bg-[#5aaa37] transition-all duration-500 cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} />
              Agregar producto
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};
