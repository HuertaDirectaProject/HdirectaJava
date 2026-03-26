import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FiltersBar } from "../../../components/Home/FiltersBar";
import { useEffect, useState } from "react";
import ProductCard from "../../../components/Home/ProductCard";
import { API_URL } from "../../../config/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  ownerId?: number;
  producerName?: string;
  category?: string;
  reviewCount?: number;
  averageRating?: number;
}

export const ProductosPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`, {
      credentials: "include", // 🔥 importante si usas cookies/sesión
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener productos");
        return res.json();
      })
      .then((data) => {
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.idProduct,
          name: p.nameProduct,
          image: `${API_URL}/uploads/productos/${p.imageProduct}`, // 🔥 dinámico
          ownerId: p.userId ?? p.idUser ?? p.idProducer,
          producerName: p.userName,
          category: p.category,
          price: p.price,
          stock: p.stock,
          reviewCount: p.reviewCount,
          averageRating: p.averageRating,
        }));

        setProducts(mappedProducts);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section
        className="
        py-16 px-10 min-h-screen
        bg-linear-to-b from-[#FEF5DC] via-white to-[#FEF5DC]
        dark:bg-[#1A221C]
        dark:from-[#1A221C]
        dark:via-white/20
        dark:to-[#1A221C]
      "
      >
        <div className="max-w-330 mx-auto">
          <FiltersBar title="Todos Los Productos" icon={faBoxOpen} />

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <p className="text-center mt-10 text-gray-500">
              No hay productos disponibles
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mt-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};