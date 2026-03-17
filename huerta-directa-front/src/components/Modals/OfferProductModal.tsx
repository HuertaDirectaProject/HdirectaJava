import React from "react";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../GlobalComponents/Modal";
import { Button } from "../GlobalComponents/Button";
import type { Product } from "../../types/Product";

interface OfferProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave?: (updatedProduct: Product) => void;
}

export const OfferProductModal: React.FC<OfferProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [inputValue, setInputValue] = React.useState<string>("0");

  React.useEffect(() => {
    if (product) {
      setInputValue(String(product.discountOffer || 0));
    }
  }, [product]);

  const handleUpdate = () => {
    if (onSave && product) {
      const discountOffer = Math.max(0, Math.min(100, Number(inputValue) || 0));
      onSave({ ...product, discountOffer });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aplicar Oferta"
      icon={faTag}
    >
      <div className="p-6 flex flex-col gap-6">
        <p className="text-gray-500 italic">
          Aplica un descuento a <b>{product?.nameProduct}</b>
        </p>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700">Porcentaje de Descuento (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="p-3 border-2 border-gray-100 rounded-xl focus:border-[#8dc84b] outline-none transition-all"
          />
          <p className="text-sm text-gray-400">
            Un valor de 0 significa que el producto no tiene descuento activo.
          </p>
        </div>

        <Button
          text="Aplicar Descuento"
          className="bg-orange-500 text-white rounded-xl py-4 font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all border-none"
          onClick={handleUpdate}
        />
      </div>
    </Modal>
  );
};
