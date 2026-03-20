import { Button } from "../Button";
import { useEffect } from "react";
import {
  faCartShopping,
  faCircleXmark,
  faCreditCard,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCart } from "../../../contexts/CartContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CartDropdown = ({ open, onClose }: Props) => {
  const { items, totals, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0
          bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          z-40
          ${open ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* PANEL */}
      <div
        className={`
          fixed top-0 right-0
          h-full w-150
          bg-white
          shadow-2xl
          transition-transform duration-500
          z-50
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="p-6 flex items-center justify-between bg-black ">
          <h2 className="text-white text-lg font-semibold uppercase tracking-wide flex gap-2 items-center ">
            <FontAwesomeIcon icon={faCartShopping} className="text-[#8dc84b]" />
            <span>Tu carrito</span>
            <span className="bg-[#8dc84b] text-white ml-4 text-xs font-semibold px-3 py-1 rounded-full shadow">
              {items.length} items
            </span>
          </h2>

          <Button
            text=""
            className="gap-0! bg-transparent! text-xl text-white"
            onClick={onClose}
            iconLetf={faCircleXmark}
          />
        </div>

        {/* CONTENIDO */}
        <div className="overflow-y-auto h-[70%] dark:bg-[#1A221C] dark:text-white">
          <div className="flex justify-between px-20 py-2 border-b border-gray-400 items-center my-1 uppercase text-gray-700 font-bold dark:text-white ">
            <p>Producto</p>
            <p>Cant.</p>
            <p>Total</p>
          </div>

          <div className="p-6 flex flex-col gap-3 ">
            {items.length === 0 && (
              <p className="text-center text-gray-400">Tu carrito está vacío</p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border border-gray-400/50 shadow rounded-xl h-20 px-3 duration-500 transition  hover:bg-gray-100/70 dark:hover:bg-[#1A22]"
              >
                {/* INFO */}
                <div className="w-45 flex items-center gap-2">
                  {item.imagen && (
                    <img
                      src={item.imagen}
                      className="rounded-md w-16"
                      alt={item.nombre}
                    />
                  )}
                  <div>
                    <p className="font-bold tracking-wide">{item.nombre}</p>
                    <p className="text-gray-500">
                      ${item.precio.toLocaleString()} / U
                    </p>
                  </div>
                </div>

                {/* CANTIDAD */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden dark:text-white dark:bg-black  bg-white cursor-pointer ">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="px-4 py-2 cursor-pointer"
                    >
                      -
                    </button>

                    <span className="px-4 py-2 font-bold w-12 text-center">
                      {item.cantidad}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="px-4 py-2 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="w-26 text-center font-semibold">
                  ${item.subtotal.toLocaleString()}
                </div>

                {/* ELIMINAR */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 text-lg cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute p-6 bottom-0 w-full border-t border-gray-400/50  bg-white dark:bg-[#1A221C] dark:text-white">
          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span className="font-semibold">
              ${totals.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span>Total:</span>
            <span className="font-bold text-[20px]">
              ${totals.total.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <Button
              text="Vaciar"
              iconLetf={faTrashCan}
              onClick={clearCart}
              className="bg-gray-500/40 hover:bg-gray-500/60 px-4 py-2 rounded-md cursor-pointer"
            />

            <Button
                text="Proceder al Pago"
                to="/payment/checkout"
                iconLetf={faCreditCard}
                className="bg-[#8cc63f] hover:bg-[#6da82f] px-7 py-3 rounded-md text-white"
            />
          </div>

          <div className="flex justify-center mt-4">
            <p className="text-gray-400 text-sm">
              Impuestos y envío calculados al final de la compra.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
