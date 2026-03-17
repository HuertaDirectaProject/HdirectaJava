import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProductCard from "../../components/Home/ProductCard";
import { favoriteService } from "../../services/favoriteService";
import { API_URL } from "../../config/api";

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  isFavorite: boolean;
}

export const DashboardFavorites: React.FC = () => {
  usePageTitle("Mis Favoritos");
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getFavorites();
      const mapped = data.map((p: { idProduct: number; nameProduct: string; price: number; stock: number; imageProduct: string; category: string }) => ({
        id: p.idProduct,
        name: p.nameProduct,
        price: p.price,
        stock: p.stock,
        image: `${API_URL}/uploads/productos/${p.imageProduct}`,
        category: p.category,
        isFavorite: true,
      }));
      setFavoriteProducts(mapped);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white">
        Mis Productos Favoritos
      </h1>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200/60 dark:border-zinc-700 min-h-64">
        {loading ? (
          <p className="text-gray-500 italic">Cargando favoritos...</p>
        ) : favoriteProducts.length === 0 ? (
          <p className="text-gray-500 italic">No tienes productos en favoritos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((fp) => (
              <ProductCard key={fp.id} product={fp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFavorites;
