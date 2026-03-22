import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";
import type { Product } from "../../types/Product";

export const OffersSection = () => {
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/offers`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setOffers(data);
        } else {
          console.error("Failed to fetch offers:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return null;
  if (offers.length === 0) return null;

  return (
    <section
      className="w-full py-20 transition-colors! duration-500! 
      bg-linear-to-b from-white via-white to-[#FEF5DC]
      dark:bg-[#1A221C] dark:from-white/20 dark:via-[#1A221C] dark:to-[#1A221C]"
    >
      <div className="max-w-330 mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#8dc84b]">
            Ofertas del Día
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Aprovecha nuestros descuentos especiales en productos frescos
            seleccionados para hoy
          </p>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          {offers.map((offer) => (
            <div
              key={offer.idProduct}
              className="
                w-70
                flex flex-col
                items-center
                text-center
                border
                border-gray-400/10
                dark:border-gray-700/40
                p-9
                rounded-2xl
                shadow-xl
                transition-all duration-500 ease-in-out
                hover:-translate-y-3
                hover:shadow-2xl
                bg-white
                dark:bg-[#111814]
                dark:hover:bg-[#1A221C]
                gap-4
              "
            >
              <img
                src={`${API_URL}/uploads/productos/${offer.imageProduct}`}
                alt={offer.nameProduct}
                className="w-35 h-35 object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Producto";
                }}
              />

              <h3 className="font-bold text-lg text-[#333128] dark:text-gray-200">
                {offer.nameProduct}
              </h3>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[#8dc84b] font-bold text-xl">
                  -{offer.discountOffer}%
                </p>
                <p className="text-gray-400 line-through text-sm">
                  ${offer.price?.toLocaleString()}
                </p>
                <p className="text-[#333128] dark:text-gray-200 font-black text-lg">
                  ${(Number(offer.price) * (1 - (offer.discountOffer || 0) / 100)).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
