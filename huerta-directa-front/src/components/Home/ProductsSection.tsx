import { useEffect, useState } from "react";
import { FiltersBar } from "./FiltersBar";
import ProductCard from "./ProductCard";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../config/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  reviewCount?: number;
  averageRating?: number;
  discountOffer?: number;
}

export const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.idProduct,
          name: p.nameProduct,
          image: `${API_URL}/uploads/productos/${p.imageProduct}`,
          category: p.category,
          price: p.price,
          stock: p.stock,
          reviewCount: p.reviewCount,
          averageRating: p.averageRating,
          discountOffer: p.discountOffer,
        }));

        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section
      className="
      py-16 px-10
      bg-linear-to-b
      from-[#FEF5DC] via-white to-[#FEF5DC]
       dark:bg-[#1A221C]
      dark:from-[#1A221C]
      dark:via-white/20
      dark:to-[#1A221C]
    "
    >
      <div className="max-w-330 mx-auto">
        <FiltersBar title="Todos Los Productos" icon={faBoxOpen} />

        {loading ? (
          <p className="text-center mt-10 text-gray-600 dark:text-gray-300">
            Cargando productos...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 justify-items-center mt-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
