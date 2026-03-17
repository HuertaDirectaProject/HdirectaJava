import React from "react";
import type { Product } from "../../../types/Product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SinImagenHuerta from "../../../assets/SinImagenHuerta.png";
import {
  faMagnifyingGlass,
  faBorderAll,
  faListUl,
  faFileExcel,
  faFilePdf,
  faCloudArrowUp,
  faPen,
  faTrash,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../../config/api";

import { Button } from "../../GlobalComponents/Button";

interface Props {
  products: Product[];
  handleDeleteProduct: (id: number) => void;
  filteredProducts: Product[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;

  handleEditProduct: (product: Product) => void;
  handleOpenOfferModal: (product: Product) => void;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
  setIsUploadModalOpen: (value: boolean) => void;
}

export const ProductManager: React.FC<Props> = ({
  filteredProducts,
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  viewMode,
  setViewMode,
  handleEditProduct,
  handleOpenOfferModal,
  handleExportExcel,
  handleExportPdf,
  setIsUploadModalOpen,
  handleDeleteProduct,
}) => {
  return (
    <section className="bg-white pb-42 dark:bg-[#1A221C] p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 dark:border-[#24302A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestión de Productos
        </h2>

        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex bg-gray-100 dark:bg-[#101922] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#1f2a22] text-[#8dc84b] shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#1f2a22] text-[#8dc84b] shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              <FontAwesomeIcon icon={faBorderAll} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              text="Excel"
              iconLetf={faFileExcel}
              onClick={handleExportExcel}
              className="bg-[#8dc84b] text-white px-4 py-2 rounded-xl"
            />

            <Button
              text="PDF"
              iconLetf={faFilePdf}
              onClick={handleExportPdf}
              className="bg-[#004d00] text-white px-4 py-2 rounded-xl"
            />

            <Button
              text="Carga Masiva"
              iconLetf={faCloudArrowUp}
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 dark:bg-[#101922] p-6 rounded-2xl border border-gray-100 dark:border-[#24302A] mb-6">
        <div className="flex-1 min-w-62.5 relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full pl-12 pr-4 py-3 border-2 border-transparent rounded-xl outline-none 
        focus:border-[#8dc84b] bg-white dark:bg-[#1e293b] text-gray-800 dark:text-white
        transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="p-3 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-white
  border-2 border-gray-100 dark:border-[#24302A] rounded-xl font-semibold outline-none min-w-45"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          <option value="frutas">Frutas</option>
          <option value="verduras-hortalizas">Verduras y hortalizas</option>
          <option value="lacteos">Lácteos</option>
          <option value="carnes-y-proteinas">Carnes y proteínas</option>
          <option value="cereales-y-granos">Cereales y granos</option>
          <option value="productos-organicos">Productos orgánicos</option>
          <option value="miel-y-derivados">Miel y derivados</option>
          <option value="bebidas-naturales">Bebidas naturales</option>
          <option value="cajas-combos">Cajas mixtas o combos</option>
        </select>
      </div>

      {/* LIST */}
      {viewMode === "list" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#24302A] text-gray-400 font-bold uppercase text-xs tracking-wider">
                <th className="py-4 px-4">Producto</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4">Precio</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-[#24302A]">
              {filteredProducts.map((p) => (
                <tr
                  key={p.idProduct}
                  className="hover:bg-gray-50/50 dark:hover:bg-[#111712]"
                >
                  <td className="py-5 px-4 font-semibold text-gray-800 dark:text-white">
                    {p.nameProduct}
                  </td>

                  <td className="py-5 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {p.category}
                  </td>

                  <td className="py-5 px-4 font-bold text-[#004d00] dark:text-[#8dc84b]">
                    ${p.price.toLocaleString()}
                  </td>

                  <td className="py-5 px-4 text-gray-700 dark:text-gray-300">
                    {p.stock} {p.unit}
                  </td>

                  <td className="py-5 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenOfferModal(p)}
                        className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-[#101922] text-orange-500
                    hover:bg-orange-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                        title="Aplicar Oferta"
                      >
                        <FontAwesomeIcon icon={faTag} />
                      </button>

                      <button
                        onClick={() => handleEditProduct(p)}
                        className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#101922] text-[#8dc84b]
                    hover:bg-[#8dc84b] hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>

                      <Button
                        text=""
                        iconLetf={faTrash}
                        onClick={() => handleDeleteProduct(p.idProduct)}
                        className="w-9 h-9 gap-0! rounded-lg bg-red-50 dark:bg-[#101922] text-black! dark:text-white! hover:bg-red-600 hover:text-white transition-colors"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID  SQUARE*/
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {filteredProducts.map((p) => (
            <div
              key={p.idProduct}
              className="bg-white dark:bg-[#1c2c21] border-2 border-gray-100 dark:border-[#24302A]
          rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] hover:shadow-lg transition-all duration-300"
            >
              <div className="relative w-full h-40 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#101922]">
                <img
                  src={`${API_URL}/uploads/productos/${p.imageProduct}`}
                  alt={p.nameProduct}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = SinImagenHuerta;
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {p.nameProduct}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {p.category}
                </p>
              </div>

              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50 dark:border-[#24302A]">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Precio
                  </p>
                  <p className="text-xl font-bold text-[#004d00] dark:text-[#8dc84b]">
                    ${p.price.toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    p.stock > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {p.stock} {p.unit}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleOpenOfferModal(p)}
                  className="w-10 h-9 rounded-lg bg-orange-50 dark:bg-[#101922] cursor-pointer
              text-orange-500 hover:bg-orange-500 hover:text-white transition-all font-bold flex items-center justify-center"
                  title="Aplicar Oferta"
                >
                  <FontAwesomeIcon icon={faTag} />
                </button>

                <button
                  onClick={() => handleEditProduct(p)}
                  className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-[#101922] cursor-pointer
              text-[#8dc84b] hover:bg-[#8dc84b] hover:text-white transition-all font-bold"
                >
                  Editar
                </button>

                 <Button
                        text=""
                        iconLetf={faTrash}
                        onClick={() => handleDeleteProduct(p.idProduct)}
                        className="w-9 h-9 gap-0! rounded-lg bg-red-50 dark:bg-[#101922] text-black! dark:text-white! hover:bg-red-600 hover:text-white transition-colors"
                      />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
