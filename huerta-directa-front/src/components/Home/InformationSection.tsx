import {
  faCreditCard,
  faStore,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const InformationSection = () => {
return (
  <section
    className="
      transition-colors duration-500
      w-full py-20
      bg-linear-to-b from-[#FEF5DC] via-white to-white
      dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-[#1A221C] dark:to-white/20
    "
  >
    <div className="max-w-6xl mx-auto px-4">
      <div
        className="
          bg-white dark:bg-[#111814]
          rounded-2xl border
          border-gray-400/10 dark:border-gray-700/40
          shadow-xl
          px-6 py-10 sm:px-10 lg:px-16
          transition-colors duration-300
        "
      >
        {/* GRID RESPONSIVE */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-8
            text-center
            justify-items-center
          "
        >
          {/* Item 1 */}
          <div
            className="
              flex flex-col items-center justify-center
              w-full max-w-62.5
              p-4 rounded-xl
              hover:bg-gray-50 dark:hover:bg-[#1A221C]
              transition-all duration-500
            "
          >
            <FontAwesomeIcon
              icon={faStore}
              className="text-5xl text-[#8dc84b] mb-3"
            />
            <h3 className="text-[17px] font-semibold text-[#333128] dark:text-gray-200 capitalize">
              Venta directa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Del campo a tu mesa, sin ningún intermediario.
            </p>
          </div>

          {/* Item 2 */}
          <div
            className="
              flex flex-col items-center justify-center
              w-full max-w-62.5
              p-4 rounded-xl
              hover:bg-gray-50 dark:hover:bg-[#1A221C]
              transition-all duration-500
            "
          >
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-5xl text-[#8dc84b] mb-3"
            />
            <h3 className="text-[17px] font-semibold text-[#333128] dark:text-gray-200 capitalize">
              Pagos seguros
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compra fácil y con confianza.
            </p>
          </div>

          {/* Item 3 */}
          <div
            className="
              flex flex-col items-center justify-center
              w-full max-w-62.5
              p-4 rounded-xl
              hover:bg-gray-50 dark:hover:bg-[#1A221C]
              transition-all duration-500
            "
          >
            <FontAwesomeIcon
              icon={faTruckMoving}
              className="text-5xl text-[#8dc84b] mb-3"
            />
            <h3 className="text-[17px] font-semibold text-[#333128] dark:text-gray-200 capitalize">
              Entrega a domicilio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recibe fresco y rápido.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
};