import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SinImagenHuerta from "../../../assets/SinImagenHuerta.png";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface ProductPreviewProps {
  images: { file: File; preview: string }[];
  currentImageIndex: number;
  prevImage: () => void;
  nextImage: () => void;
  formData: {
    name: string;
    description: string;
    price: string;
    stock: string;
  };
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  images,
  currentImageIndex,
  prevImage,
  nextImage,
  formData,
}) => {
  return (
    <div className="bg-white dark:bg-[#1A221C] rounded-4xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 group hover:shadow-2xl hover:shadow-[#8dc84b]/20 transition-all duration-300 flex flex-col h-full max-w-sm mx-auto w-full">
      
      {/* IMAGEN */}
      <div className="relative h-64 overflow-hidden group/slider">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex].preview}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-50 dark:bg-[#111712] border-b border-gray-100 dark:border-slate-700">
  <img
    src={SinImagenHuerta}
    alt="Sin imagen"
    className="w-full h-full object-cover opacity-80"
  />
</div>
        )}
      </div>

      {/* INFO PRODUCTO */}
      <div className="p-8 flex flex-col grow">
        <h3 className="text-2xl font-black text-[#004d00] dark:text-white">
          {formData.name || "Nombre del Producto"}
        </h3>

        <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
          {formData.description ||
            "Agrega una descripción para tu producto para que los compradores puedan conocer los detalles."}
        </p>

        <div className="mt-auto flex justify-between items-end bg-gray-50 dark:bg-[#111712] p-4 rounded-2xl">
          <div>
            <span className="text-gray-400 text-xs font-bold block mb-1">
              Precio
            </span>

            <span className="text-2xl font-black text-[#8dc84b]">
              ${Number(formData.price || 0).toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-gray-400 text-xs font-bold block mb-1">
              Stock Disp.
            </span>

            <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
              {formData.stock || 0} un.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};