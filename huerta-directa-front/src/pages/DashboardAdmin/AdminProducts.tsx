import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faEye, faTrash, faCheck, faBan, faBorderAll, faListUl, faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../components/GlobalComponents/Button";
import { usePageTitle } from "../../hooks/usePageTitle";
import { NotifyProducerModal } from "../../components/Modals/NotifyProducerModal";
import { API_URL } from "../../config/api";
import authService from "../../services/authService";

interface ProductInfo {
  id: number;
  name: string;
  producer: string;
  ownerId?: number;
  category: string;
  price: number;
  stock: number;
  status: "Aprobado" | "Pendiente" | "Rechazado";
  image: string;
}

const normalizeName = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export const AdminProducts: React.FC = () => {
  usePageTitle("Gestión de Productos");

  const currentUser = authService.getCurrentUser();
  const normalizedCurrentUserName = currentUser?.name ? normalizeName(currentUser.name) : null;

  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          const mappedProducts: ProductInfo[] = data.map((p: any) => ({
            id: p.idProduct,
            name: p.nameProduct,
            producer: p.userName || "Productor Desconocido",
            ownerId: p.userId ?? p.idUser ?? p.idProducer,
            category: p.category,
            price: p.price,
            stock: p.stock,
            status:
              p.status === "APPROVED" || p.status === "Aprobado" ? "Aprobado" :
              p.status === "REJECTED" || p.status === "Rechazado" ? "Rechazado" : "Pendiente",
            image: p.imageProduct ? `${API_URL}/uploads/productos/${p.imageProduct}` : "https://via.placeholder.com/150",
          }));
          setProducts(mappedProducts);
        } else {
          console.error("Error response from server:", response.status);
          alert("Error al cargar productos: " + response.statusText);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Error de conexión al cargar productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}/approve`, { method: "PUT", credentials: "include" });
      if (response.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "Aprobado" } : p));
    } catch (error) { console.error("Error approving product:", error); }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}/reject`, { method: "PUT", credentials: "include" });
      if (response.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "Rechazado" } : p));
    } catch (error) { console.error("Error rejecting product:", error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE", credentials: "include" });
      if (response.ok) setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error("Error deleting product:", error); }
  };

  const handleNotifyProducer = (product: ProductInfo) => {
    setSelectedProduct(product);
    setIsNotifyModalOpen(true);
  };

const handleExportExcel = async () => {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.append("buscar", searchTerm);
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
      throw new Error("Error al descargar el Excel");
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
    window.location.href = `${API_URL}/api/products/exportPdf?${params.toString()}`;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.producer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const isOwnProduct = (product: ProductInfo) => {
    if (currentUser?.id && product.ownerId) return currentUser.id === product.ownerId;
    if (!normalizedCurrentUserName) return false;
    return normalizeName(product.producer) === normalizedCurrentUserName;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">Gestión de Productos</h1>
      </div>

      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por producto o productor..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="flex bg-gray-100 dark:bg-[#26322a] p-1 rounded-xl mr-2">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#1f2a22] text-[#004d00] dark:text-[#6fa33b] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faListUl} /> Lista
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#1f2a22] text-[#004d00] dark:text-[#6fa33b] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faBorderAll} /> Tarjetas
              </button>
            </div>
            <Button
              text="Exportar Excel"
              iconLetf={faFileExcel}
              className="bg-[#8dc84b] dark:bg-[#6fa33b] text-white rounded-xl py-3 px-6 h-11.5"
              onClick={handleExportExcel}
            />
            <Button
              text="Exportar PDF"
              iconLetf={faFilePdf}
              className="bg-[#004d00] text-white rounded-xl py-3 px-6 h-11.5"
              onClick={handleExportPdf}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#8dc84b] dark:border-[#6fa33b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium font-outfit">Cargando productos...</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2a332c] text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 text-left pb-6">Producto</th>
                  <th className="py-4 px-4 text-left pb-6">Productor</th>
                  <th className="py-4 px-4 text-left pb-6">Precio</th>
                  <th className="py-4 px-4 text-left pb-6">Stock</th>
                  <th className="py-4 px-4 text-left pb-6">Estado</th>
                  <th className="py-4 px-4 text-center pb-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a332c]">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-[#26322a]/50 transition-colors">
                    <td className="py-5 px-4 font-bold text-gray-800 dark:text-gray-100">{product.name}</td>
                    <td className="py-5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{product.producer}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOwnProduct(product)
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                        }`}>
                          {isOwnProduct(product) ? "Mi producto" : "Otro productor"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-bold text-[#8dc84b] dark:text-[#6fa33b]">${product.price.toLocaleString()}</td>
                    <td className="py-5 px-4 text-gray-600 dark:text-gray-300">{product.stock} un.</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === "Aprobado" ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300" :
                        product.status === "Pendiente" ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300" :
                        "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-blue-500 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                          title="Notificar al Autor"
                          onClick={() => handleNotifyProducer(product)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-green-500 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                          title="Aprobar"
                          onClick={() => handleApprove(product.id)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-yellow-500 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                          title="Rechazar"
                          onClick={() => handleReject(product.id)}
                        >
                          <FontAwesomeIcon icon={faBan} />
                        </button>
                        <button
                          className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                          title="Eliminar"
                          onClick={() => handleDelete(product.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No hay productos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-[#1A221C] border-2 border-gray-100 dark:border-[#2a332c] rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] dark:hover:border-[#6fa33b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#26322a] flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Sin+Imagen"; }}
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    product.status === "Aprobado" ? "bg-green-500 text-white" :
                    product.status === "Pendiente" ? "bg-yellow-500 text-white" :
                    "bg-red-500 text-white"
                  }`}>
                    {product.status}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <p className="text-gray-400 dark:text-gray-500 text-xs font-bold tracking-widest uppercase">Cod: #{product.id}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1" title={product.name}>{product.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{product.producer}</p>
                  <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isOwnProduct(product)
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                  }`}>
                    {isOwnProduct(product) ? "Mi producto" : "Otro productor"}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50 dark:border-[#2a332c]">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Precio Unit.</p>
                    <p className="text-xl font-black text-[#8dc84b] dark:text-[#6fa33b]">${product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Stock Disp.</p>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{product.stock} un.</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  <button
                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-blue-500 hover:text-white transition-all cursor-pointer flex items-center justify-center col-span-1 shadow-sm"
                    title="Notificar al Autor"
                    onClick={() => handleNotifyProducer(product)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-green-500 hover:text-white transition-all cursor-pointer flex items-center justify-center col-span-1 shadow-sm"
                    title="Aprobar"
                    onClick={() => handleApprove(product.id)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-yellow-500 hover:text-white transition-all cursor-pointer flex items-center justify-center col-span-1 shadow-sm"
                    title="Rechazar"
                    onClick={() => handleReject(product.id)}
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                  <button
                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center col-span-1 shadow-sm"
                    title="Eliminar"
                    onClick={() => handleDelete(product.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
            {paginatedProducts.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-[#2a332c] rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No se encontraron productos con esos términos.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#8dc84b] dark:bg-[#6fa33b] text-white shadow-md shadow-[#8dc84b]/30"
                      : "bg-gray-100 dark:bg-[#26322a] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1f2a22]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      <NotifyProducerModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        product={selectedProduct}
        onSend={() => {}}
      />
    </div>
  );
};

export default AdminProducts;