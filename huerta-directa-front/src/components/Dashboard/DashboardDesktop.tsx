import React from "react";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../GlobalComponents/Button";
import { Modal } from "../GlobalComponents/Modal";
import { EditProductModal } from "../Modals/EditProductModal";
import { OfferProductModal } from "../Modals/OfferProductModal";
import { InsightsGrid } from "./PanelDeControl/InsightsGrid";
import { DashboardAside } from "./PanelDeControl/DashboardAside";
import { ProductManager } from "./PanelDeControl/ProductManager";
import { useDashboard } from "../../hooks/useDashboard";

const DashboardDesktop: React.FC = () => {
  const {
    products,
    removeProduct,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isOfferModalOpen,
    setIsOfferModalOpen,
    selectedProduct,
    setUploadFile,
    uploadResult,
    viewMode,
    setViewMode,
    insights,
    filteredProducts,
    handleExportExcel,
    handleExportPdf,
    handleUploadSubmit,
    handleEditProduct,
    handleSaveProduct,
    handleOpenOfferModal,
    handleApplyOffer,
  } = useDashboard();

  return (
    <div className="w-full hidden md:block">
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

export default DashboardDesktop;
