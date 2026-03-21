import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFileExcel,
  faFilePdf,
  faCloudArrowUp,
  faPen,
  faTrash,
  faTag,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../config/api";
import SinImagenHuerta from "../../assets/SinImagenHuerta.png";
import { Button } from "../GlobalComponents/Button";
import { Modal } from "../GlobalComponents/Modal";
import { EditProductModal } from "../Modals/EditProductModal";
import { OfferProductModal } from "../Modals/OfferProductModal";
import { useDashboard } from "../../hooks/useDashboard";

export const DashboardMobile: React.FC = () => {
  const {
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
    <div className="md:hidden w-full pb-24 bg-gray-50 dark:bg-[#1A221C] min-h-screen">
      {/* Header Section */}
      <div className="bg-linear-to-br from-[#004d00] to-[#8dc84b] p-6 rounded-b-[40px] shadow-lg mb-6">
        <h1 className="text-2xl font-black text-white mb-2">Mi Dashboard</h1>
        <p className="text-white/80 text-sm">Gestiona tus productos y ventas</p>
        
        {/* Quick Stats Scrollable */}
        <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
          {insights.map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl min-w-[140px] border border-white/20">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{item.title}</p>
              <h3 className="text-white text-xl font-black mt-1">{item.value}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[#8dc84b] text-[10px] font-bold">+{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mi producto..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#24302A] rounded-2xl shadow-sm outline-none border-2 border-transparent focus:border-[#8dc84b] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full p-3 bg-white dark:bg-[#24302A] rounded-2xl shadow-sm outline-none border-2 border-transparent focus:border-[#8dc84b] font-semibold text-gray-700 dark:text-gray-300"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="frutas">Frutas</option>
            <option value="verduras-hortalizas">Verduras y hortalizas</option>
            {/* ... other options can be added here but for brevity keeping it short ... */}
          </select>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Productos ({filteredProducts.length})</h2>
          </div>
          
          {filteredProducts.map((p) => (
            <div key={p.idProduct} className="bg-white dark:bg-[#24302A] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                  src={`${API_URL}/uploads/productos/${p.imageProduct}`}
                  alt={p.nameProduct}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = SinImagenHuerta; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{p.nameProduct}</h3>
                <p className="text-xs text-gray-500 truncate">{p.category}</p>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[#004d00] dark:text-[#8dc84b] font-black">${p.price.toLocaleString()}</span>
                  <span className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg text-gray-500">{p.stock} {p.unit}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEditProduct(p)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/10 text-[#8dc84b] flex items-center justify-center"><FontAwesomeIcon icon={faPen} size="xs" /></button>
                <button onClick={() => handleOpenOfferModal(p)} className="w-8 h-8 rounded-full bg-orange-50 dark:bg-white/10 text-orange-500 flex items-center justify-center"><FontAwesomeIcon icon={faTag} size="xs" /></button>
                <button onClick={() => removeProduct(p.idProduct)} className="w-8 h-8 rounded-full bg-red-50 dark:bg-white/10 text-red-500 flex items-center justify-center"><FontAwesomeIcon icon={faTrash} size="xs" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={() => window.location.href = "/DashBoardAgregarProducto"}
          className="w-14 h-14 bg-[#8dc84b] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform mb-2 border-4 border-white dark:border-[#1A221C]"
          title="Agregar Producto"
        >
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </button>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform opacity-90"
          title="Carga Masiva"
        >
          <FontAwesomeIcon icon={faCloudArrowUp} />
        </button>
        <button
          onClick={handleExportExcel}
          className="w-12 h-12 bg-[#8dc84b] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform opacity-90"
          title="Exportar Excel"
        >
          <FontAwesomeIcon icon={faFileExcel} />
        </button>
        <button
          onClick={handleExportPdf}
          className="w-12 h-12 bg-[#004d00] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform opacity-90"
          title="Exportar PDF"
        >
          <FontAwesomeIcon icon={faFilePdf} />
        </button>
      </div>

      {/* Modals from Hook logic */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Carga Masiva" icon={faCloudArrowUp}>
        <div className="p-6">
          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
              className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center"
            />
            <Button type="submit" text="Subir" className="w-full py-3 rounded-2xl" />
          </form>
          {uploadResult && <div className={`mt-4 p-4 rounded-xl text-center text-sm font-bold ${uploadResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{uploadResult.message}</div>}
        </div>
      </Modal>

      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSave={handleSaveProduct} />
      <OfferProductModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} product={selectedProduct} onSave={handleApplyOffer} />
    </div>
  );
};

export default DashboardMobile;
