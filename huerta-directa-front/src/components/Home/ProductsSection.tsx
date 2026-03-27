import { useEffect, useState, useRef } from "react";
import { FiltersBar } from "./FiltersBar";
import ProductCard from "./ProductCard";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../config/api";

// Swiper imports - REMOVED since we use grid now

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/products/available`, { credentials: "include" })
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

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section
      ref={sectionRef}
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
        <FiltersBar title="Nuestros Productos" icon={faBoxOpen} />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-10">
            {/* Grid de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="flex justify-center">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    scrollToSection();
                  }}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8dc84b] hover:text-white transition-all shadow-sm border border-gray-100 dark:border-zinc-700 font-bold cursor-pointer"
                >
                  Anterior
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          scrollToSection();
                        }}
                        className={`w-11 h-11 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center ${
                          currentPage === page
                            ? "bg-[#8dc84b] text-white shadow-xl shadow-[#8dc84b]/20 scale-110"
                            : "bg-white dark:bg-zinc-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-100 dark:border-zinc-700"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    scrollToSection();
                  }}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8dc84b] hover:text-white transition-all shadow-sm border border-gray-100 dark:border-zinc-700 font-bold cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
