import { useState } from "react";
import Swal from "sweetalert2";
import { useProducts } from "./Productos/useProducts";
import { updateProduct } from "../services/productService";
import type { Product } from "../types/Product";
import { API_URL } from "../config/api";

export interface InsightItem {
  title: string;
  value: string;
  percentage: number;
  footer: string;
  color: string;
}

export const useDashboard = () => {
  const { products, setProducts, removeProduct, fetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const insights: InsightItem[] = [
    { title: "Ventas", value: "$25,000", percentage: 81, footer: "Ultimas 24 horas", color: "sales" },
    { title: "Gastos", value: "$15,567", percentage: 62, footer: "Ultimas 24 horas", color: "expenses" },
    { title: "Ingresos", value: "$10,240", percentage: 31, footer: "Ultimas 24 horas", color: "income" },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "" || p.category === category),
  );

const handleExportExcel = async () => {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.append("buscar", searchTerm);
  }

  if (category) {
    params.append("categoria", category);
  }

  try {
    const response = await fetch(
      `${API_URL}/api/products/exportExcel?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.error("STATUS:", response.status);
      const text = await response.text();
      console.error("RESPONSE:", text);
      throw new Error(`Error ${response.status}`);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "productos.xlsx";

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
};

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("buscar", searchTerm);
    if (category) params.append("categoria", category);
    window.location.href = `${API_URL}/api/products/exportPdf?${params.toString()}`; // ✅ Corregido
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("archivo", uploadFile);

    try {
      const response = await fetch(`${API_URL}/api/users/upload-products`, { // ✅ Corregido
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUploadResult({ success: true, message: "¡Carga masiva exitosa!" });
        fetchProducts();
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadResult(null);
        }, 2000);
      } else {
        setUploadResult({ success: false, message: result.message || "Error al cargar productos" });
      }
    } catch {
      setUploadResult({ success: false, message: "Error de conexión con el servidor" });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.idProduct, updatedProduct);
      setProducts(products.map((p) => p.idProduct === updatedProduct.idProduct ? updatedProduct : p));
      setIsEditModalOpen(false);
      Swal.fire({ icon: "success", title: "Producto actualizado", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar el producto", "error");
    }
  };

  const handleOpenOfferModal = (product: Product) => {
    setSelectedProduct(product);
    setIsOfferModalOpen(true);
  };

  const handleApplyOffer = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.idProduct, updatedProduct);
      setProducts(products.map((p) => p.idProduct === updatedProduct.idProduct ? updatedProduct : p));
      setIsOfferModalOpen(false);
      Swal.fire({ icon: "success", title: "Oferta aplicada", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo aplicar la oferta", "error");
    }
  };

  return {
    products, setProducts, removeProduct, fetchProducts,
    searchTerm, setSearchTerm,
    category, setCategory,
    isUploadModalOpen, setIsUploadModalOpen,
    isEditModalOpen, setIsEditModalOpen,
    isOfferModalOpen, setIsOfferModalOpen,
    selectedProduct, setSelectedProduct,
    uploadFile, setUploadFile,
    uploadResult, setUploadResult,
    viewMode, setViewMode,
    insights, filteredProducts,
    handleExportExcel, handleExportPdf,
    handleUploadSubmit, handleEditProduct,
    handleSaveProduct, handleOpenOfferModal,
    handleApplyOffer,
  };
};