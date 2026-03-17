import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { deleteProduct, getMyProducts } from "../../services/productService";
import type { Product } from "../../types/Product";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getMyProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteProduct(id);

      setProducts((prev) => prev.filter((p) => p.idProduct !== id));

      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    removeProduct,
    setProducts,
  };
};
