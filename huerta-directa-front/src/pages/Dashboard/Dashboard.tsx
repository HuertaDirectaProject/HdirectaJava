import React, { useState } from "react";

import {
  faCloudArrowUp,

  //faUpload,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { usePageTitle } from "../../hooks/usePageTitle";

// Reusable components
import { Button } from "../../components/GlobalComponents/Button";
import { Modal } from "../../components/GlobalComponents/Modal";
import { EditProductModal } from "../../components/Modals/EditProductModal";
import { OfferProductModal } from "../../components/Modals/OfferProductModal";
import { InsightsGrid } from "../../components/Dashboard/PanelDeControl/InsightsGrid";
import { DashboardAside } from "../../components/Dashboard/PanelDeControl/DashboardAside";
import { ProductManager } from "../../components/Dashboard/PanelDeControl/ProductManager";

import type { Product } from "../../types/Product";
import { updateProduct } from "../../services/productService";
import { useProducts } from "../../hooks/Productos/useProducts";

interface InsightItem {
  title: string;
  value: string;
  percentage: number;
  footer: string;
  color: string;
}

export const Dashboard: React.FC = () => {
  usePageTitle("Dashboard");

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
    {
      title: "Ventas",
      value: "$25,000",
      percentage: 81,
      footer: "Ultimas 24 horas",
      color: "sales",
    },
    {
      title: "Gastos",
      value: "$15,567",
      percentage: 62,
      footer: "Ultimas 24 horas",
      color: "expenses",
    },
    {
      title: "Ingresos",
      value: "$10,240",
      percentage: 31,
      footer: "Ultimas 24 horas",
      color: "income",
    },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.nameProduct.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "" || p.category === category),
  );

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("buscar", searchTerm);
    if (category) params.append("categoria", category);
    window.location.href = `/api/products/exportExcel?${params.toString()}`;
  };

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("buscar", searchTerm);
    if (category) params.append("categoria", category);
    window.location.href = `/api/products/exportPdf?${params.toString()}`;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("archivo", uploadFile);

    try {
      const response = await fetch("/api/users/upload-products", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUploadResult({ success: true, message: "¡Carga masiva exitosa!" });
        fetchProducts(); // Refresh list
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadResult(null);
        }, 2000);
      } else {
        setUploadResult({
          success: false,
          message: result.message || "Error al cargar productos",
        });
      }
    } catch {
      setUploadResult({
        success: false,
        message: "Error de conexión con el servidor",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.idProduct, updatedProduct);
      setProducts(
        products.map((p) =>
          p.idProduct === updatedProduct.idProduct ? updatedProduct : p,
        ),
      );
      setIsEditModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Producto actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
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
      setProducts(
        products.map((p) =>
          p.idProduct === updatedProduct.idProduct ? updatedProduct : p,
        ),
      );
      setIsOfferModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Oferta aplicada",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo aplicar la oferta", "error");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
        <section className="w-full">
          {/* Insights Grid */}
          <InsightsGrid insights={insights} />

          {/* Product Management */}
          <ProductManager
            products={products}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleEditProduct={handleEditProduct}
            handleOpenOfferModal={handleOpenOfferModal}
            handleDeleteProduct={removeProduct}
            handleExportExcel={handleExportExcel}
            handleExportPdf={handleExportPdf}
            setIsUploadModalOpen={setIsUploadModalOpen}
          />
        </section>

        <DashboardAside productsCount={products.length} />
      </div>

      {/* Mass Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Carga Masiva"
        icon={faCloudArrowUp}
      >
        <div className="p-8">
          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-700">
                Seleccionar Archivo
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setUploadFile(e.target.files ? e.target.files[0] : null)
                }
                className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center cursor-pointer hover:border-[#8dc84b] transition-all"
              />
            </div>
            <Button
              type="submit"
              text="Subir Archivo"
              className="w-full py-4 rounded-2xl shadow-xl shadow-[#8dc84b]/20"
            />
          </form>
          {uploadResult && (
            <div
              className={`mt-4 p-4 rounded-xl text-center font-bold ${uploadResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {uploadResult.message}
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Offer Product Modal */}
      <OfferProductModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        product={selectedProduct}
        onSave={handleApplyOffer}
      />
    </div>
  );
};

export default Dashboard;
