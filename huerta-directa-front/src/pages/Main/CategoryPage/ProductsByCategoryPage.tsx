import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../../../components/Home/ProductCard";
import { FiltersBar } from "../../../components/Home/FiltersBar";
import { categories } from "../../../components/Home/CategoriesSection";
import { API_URL } from "../../../config/api"; // ✅ import agregado

interface ProductBackend {
  idProduct: number;
  nameProduct: string;
  price: number;
  stock: number;
  imageProduct: string;
  category: string;
  images?: string[];
}

const ProductsByCategoryPage = () => {
  const { slug } = useParams();
  const categoryData = categories.find(cat => cat.slug === slug);
  const [products, setProducts] = useState<ProductBackend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (slug) {
        setLoading(true);
        try {
          const response = await fetch(
            `${API_URL}/api/products/category/${slug}`, // ✅ reemplazado
            { credentials: "include" }
          );
          if (response.ok) {
            const data = await response.json();
            setProducts(data);
          } else {
            console.error("Error fetching category products");
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [slug]);

  return (
    <section className="bg-linear-to-b min-h-screen from-[#FEF5DC] via-white to-[#FEF5DC] dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C]">
      <div className="pb-20 pt-10 max-w-323.75 mx-auto px-6">
        <FiltersBar title={categoryData?.name ?? ""} icon={categoryData?.icon} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium font-outfit">
              Cargando productos...
            </p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No hay productos en esta categoría
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {products.map((product) => (
              <ProductCard
                key={product.idProduct}
                product={{
                  id: product.idProduct,
                  name: product.nameProduct,
                  price: product.price,
                  stock: product.stock,
                  image: `${API_URL}/uploads/productos/${product.imageProduct}`, // ✅ reemplazado
                  category: product.category,
                  images: product.images,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsByCategoryPage;