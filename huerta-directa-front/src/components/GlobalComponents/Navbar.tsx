import { Link } from "react-router-dom";
import { faBars, faCarrot } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./Button";
import { ProfileMenu } from "./ProfileMenu";
import { CartButton } from "./Cart/CartButton";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MobileNav } from "./MobileNav";

interface NavbarProp {
  className?: string;
  showInicio?: boolean;
  showCategorias?: boolean;
  showProductos?: boolean;
  showQuienesSomos?: boolean;
  showAddProduct?: boolean;
  showProfile?: boolean;
  showCart?: boolean;
}

export const Navbar = ({
  className,
  showInicio = false,
  showCategorias = false,
  showProductos = false,
  showQuienesSomos = false,
  showAddProduct = false,
  showProfile = false,
  showCart = false,
}: NavbarProp) => {
  const baseClasses =
    "max-w-330 mx-auto bg-transparent   px-10 py-4 flex items-center justify-between text-[15px] ";

  const [openMenu, setOpenMenu] = useState(false);

  return (
    <section className="max-w-full  dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C] ">
      <header
        className={`${baseClasses} ${className ?? ""} relative z-50 overflow-visible `}
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-[#8dc84b] text-[14px] mr-1 sm:text-[23px] font-bold tracking-wide hover:scale-105 transition  duration-500"
        >
          HUERTA DIRECTA
        </Link>

        {/* 🔥 BOTÓN MOBILE */}
        <button
          onClick={() => setOpenMenu(true)}
          className="md:hidden text-2xl text-[#8dc84b]"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-6">
          {showInicio && (
            <Link
              to="/HomePage"
              className="text-[#1f1f1f] text-[15px] sm:text-lg font-semibold hover:text-[#5aaa37] transition duration-500 dark:text-white"
            >
              Inicio
            </Link>
          )}
          {showProductos && (
            <Link
              to="/Productos"
              className="text-[#1f1f1f]  font-semibold hover:text-[#5aaa37] transition duration-500 dark:text-white"
            >
              Productos
            </Link>
          )}

          {showCategorias && (
            <Link
              to="/CategoryPage"
              className="text-[#1f1f1f] font-semibold hover:text-[#5aaa37] transition duration-500 dark:text-white"
            >
              Categorías
            </Link>
          )}

          {showQuienesSomos && (
            <Link
              to="/QuienesSomos"
              className="text-[#1f1f1f] text-[14px] sm:text-lg font-semibold hover:text-[#5aaa37] transition duration-500 dark:text-white"
            >
              Quiénes Somos
            </Link>
          )}

          {showAddProduct && (
            <Button
              text="Agrega productos"
              to="/DashBoardAgregarProducto"
              iconRight={faCarrot}
              className="bg-[#78d64b] hover:bg-[#5aaa37] rounded-lg px-5 py-2 "
            />
          )}

          {/* 🛒 CARRITO (nuevo) */}
          {showCart && <CartButton />}

          {showProfile && <ProfileMenu />}
        </nav>
      </header>
      <MobileNav
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        showInicio={showInicio}
        showCategorias={showCategorias}
        showProductos={showProductos}
        showQuienesSomos={showQuienesSomos}
        showAddProduct={showAddProduct}
        showProfile={showProfile}
        showCart={showCart}
      />
    </section>
  );
};
