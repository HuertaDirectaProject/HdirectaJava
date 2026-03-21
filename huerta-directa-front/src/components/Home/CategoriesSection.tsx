import { Link } from "react-router-dom";
import {
  faAppleWhole,
  faCarrot,
  faCow,
  faDrumstickBite,
  faBowlFood,
  faCookie,
  faPlateWheat,
  faGlassWater,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const categories = [
  { name: "Frutas", icon: faAppleWhole, slug: "frutas" },
  {
    name: "Verduras y hortalizas",
    icon: faCarrot,
    slug: "verduras-hortalizas",
  },
  { name: "Lácteos", icon: faCow, slug: "lacteos" },
  {
    name: "Carnes y proteínas",
    icon: faDrumstickBite,
    slug: "carnes-y-proteinas",
  },
  { name: "Cereales y granos", icon: faBowlFood, slug: "cereales-y-granos" },
  { name: "Productos orgánicos", icon: faCookie, slug: "productos-organicos" },
  { name: "Miel y derivados", icon: faPlateWheat, slug: "miel-y-derivados" },
  { name: "Bebidas naturales", icon: faGlassWater, slug: "bebidas-naturales" },
  { name: "Cajas mixtas o combos", icon: faBoxOpen, slug: "cajas-combos" },
];

const CategoriesSection = () => {
  return (
    <section
      id="categorias"
      className="
      py-12
      bg-linear-to-b
      from-[#FEF5DC] via-white to-[#FEF5DC]
      dark:bg-[#1A221C]
      dark:from-[#1A221C]
      dark:via-white/20
      dark:to-[#1A221C]
      transition-colors
    "
    >
      <div className="max-w-6xl mx-auto px-4 grid gap-10 lg:grid-cols-2 items-center">
        {/* LADO IZQUIERDO */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Categorías
          </h1>

          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-8 leading-relaxed">
            Los productos de mejor calidad y más frescos del mercado, de la
            granja a tu mesa. Explora tu producto favorito en la categoría
            indicada y descubre los maravillosos precios que maneja el campo
            para tu bolsillo.
          </p>

          <Link
            to="/QuienesSomos"
            className="
            inline-block
            bg-[#8dc84b]
            text-white
            font-semibold
            px-6 py-3
            rounded-lg
            transition-all duration-500 ease-in-out
            hover:bg-green-800
            dark:hover:bg-green-600
          "
          >
            Saber más
          </Link>
        </div>

        {/* LADO DERECHO */}
 <div
  className="
    grid
    grid-cols-2
    sm:grid-cols-3
    gap-5
  "
>
  {categories.map((category, index) => (
    <Link key={index} to={`/categoria/${category.slug}`}>
      <div
        className="
          w-full
          aspect-square 

          bg-white dark:bg-[#1A221C]
          rounded-2xl
          shadow-lg
          p-4
          border border-gray-200 dark:border-slate-700

          flex flex-col items-center justify-center gap-3

          transition-all duration-300
          hover:-translate-y-1 hover:shadow-xl
          dark:hover:bg-[#1f2a22]
        "
      >
        {/* ICONO */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#8dc84b] text-white text-2xl">
          <FontAwesomeIcon icon={category.icon} />
        </div>

        {/* TEXTO */}
        <h5
          className="
            font-semibold
            text-sm sm:text-lg
            text-center
            text-gray-900 dark:text-gray-100

            leading-tight
            line-clamp-2
          "
        >
          {category.name}
        </h5>
      </div>
    </Link>
  ))}
</div>
      </div>
    </section>
  );
};

export default CategoriesSection;
