import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUsers,
  faPen,
  faGear,
  faFileExcel,
  faFilePdf,
  faUserSlash,
  faUserCheck,
  faBoxesStacked,
  faListUl,
  faBorderAll,
  faBell,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../GlobalComponents/Button";
import { EditUserModal } from "../Modals/EditUserModal";
import { SendMassEmailModal } from "../Modals/SendMassEmailModal";
import { useDashboardAdmin } from "../../hooks/useDashboardAdmin";
import { API_URL } from "../../config/api";

const DashboardAdminDesktop: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    adminInsights,
    filteredUsers,
    productsList = [],
    handleEditUser,
    handleSaveUser,
    handleDeleteUser,
    handleExportExcel,
    handleExportPdf,
  } = useDashboardAdmin();

  const [userPage, setUserPage] = React.useState(1);
  const [productPage, setProductPage] = React.useState(1);
  const [productViewMode, setProductViewMode] = React.useState<"list" | "grid">("grid");
  const [isMassEmailOpen, setIsMassEmailOpen] = React.useState(false);
  const itemsPerPage = 5;

  const sortedUsers = [...filteredUsers].sort((a, b) => b.id - a.id);
  const totalUserPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);

  const mappedProducts = productsList.map((p: any) => ({
    id: p.idProduct,
    name: p.nameProduct,
    producer: p.producerId?.name || p.user?.name || "Desconocido",
    price: p.price,
    stock: p.stock !== undefined ? p.stock : (p.stockQuantity || 0),
    status: p.status === "APPROVED" ? "Aprobado" : p.status === "PENDING" ? "Pendiente" : "Rechazado",
    image: p.imageProduct ? `${API_URL}/uploads/productos/${p.imageProduct}` : "https://via.placeholder.com/400x300?text=Sin+Imagen",
  }));

  const sortedProducts = [...mappedProducts].sort((a, b) => b.id - a.id);
  const totalProductPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  React.useEffect(() => {
    setUserPage(1);
    setProductPage(1);
  }, [searchTerm]);

  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notifications`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full hidden md:block">
      <div className="flex justify-between items-center mb-8 sticky top-0 md:top-4 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">Panel de Administración</h1>
          <div className="relative cursor-pointer group">
            <div className="w-12 h-12 bg-white dark:bg-[#1f2a22] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a332c] flex items-center justify-center text-gray-400 dark:text-gray-400 group-hover:text-[#8dc84b] dark:group-hover:text-[#6fa33b] transition-all">
              <FontAwesomeIcon icon={faBell} size="lg" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#1f2a22] animate-pulse">
                  {notifications.length}
                </span>
              )}
            </div>
            {/* Notification dropdown */}
            <div className="absolute top-14 left-0 w-80 bg-white dark:bg-[#1f2a22] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2a332c] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-6">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-[#2a332c] pb-2">Notificaciones</h3>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No hay nuevas notificaciones</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-sm bg-gray-50 dark:bg-[#26322a] p-3 rounded-xl border-l-4 border-[#8dc84b] dark:border-[#6fa33b]">
                      <p className="text-gray-700 dark:text-gray-200 font-medium">{n.message}</p>
                      <small className="text-gray-400 dark:text-gray-500 block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {adminInsights.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1f2a22] p-8 rounded-4xl shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden border-t-4 border-[#8dc84b] dark:border-[#6fa33b]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.title}</h3>
                <h1 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{item.value}</h1>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                item.color === 'primary' ? 'bg-[#004d00]' : item.color === 'secondary' ? 'bg-[#8dc84b] dark:bg-[#6fa33b]' : 'bg-[#004d00]'
              }`}>
                <FontAwesomeIcon icon={item.icon} size="lg" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm">+{item.percentage}%</span>
              <small className="text-gray-400 dark:text-gray-500 font-medium">{item.footer}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/admin/usuarios" className="bg-[#004d00] p-6 rounded-3xl shadow-lg hover:shadow-[#004d00]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gestionar Usuarios</h3>
            <p className="text-white/70 text-sm">Ver y editar información de usuarios</p>
          </div>
        </Link>
        <Link to="/admin/productos" className="bg-[#8dc84b] dark:bg-[#6fa33b] p-6 rounded-3xl shadow-lg hover:shadow-[#8dc84b]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer text-[#004d00]">
          <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faBoxesStacked} size="lg" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Gestionar Productos</h3>
            <p className="text-[#004d00]/70 text-sm">Aprobar, editar o eliminar productos</p>
          </div>
        </Link>
        <Link to="/admin/registrar" className="bg-[#004d00] p-6 rounded-3xl shadow-lg hover:shadow-[#004d00]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group cursor-pointer text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faGear} size="lg" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Configuración</h3>
            <p className="text-white/70 text-sm">Configuraciones del sistema</p>
          </div>
        </Link>
      </div>

      {/* User Management Section */}
      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h2>
          
          <div className="relative flex-1 max-w-md w-full">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
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
              text="Exportar"
              iconLetf={faFileExcel}
              className="bg-[#8dc84b] dark:bg-[#6fa33b] text-white rounded-xl py-3 px-8 mt-2 mb-2 w-full md:w-auto"
              onClick={handleExportExcel}
            />
            <Button
              text="Reporte General"
              iconLetf={faFilePdf}
              className="bg-[#004d00] text-white rounded-xl py-3 px-8 mt-2 mb-2 w-full md:w-auto"
              onClick={handleExportPdf}
            />
            <Button
              text="Correos Masivos"
              iconLetf={faEnvelope}
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3 px-8 mt-2 mb-2 w-full md:w-auto shadow-sm transition-all"
              onClick={() => setIsMassEmailOpen(true)}
            />
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#8dc84b] dark:border-[#6fa33b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium font-outfit">Cargando base de usuarios...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2a332c] text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 text-left font-extrabold pb-6">Usuario</th>
                    <th className="py-4 px-4 text-left font-extrabold pb-6">Rol</th>
                    <th className="py-4 px-4 text-left font-extrabold pb-6">Registro</th>
                    <th className="py-4 px-4 text-left font-extrabold pb-6">Estado</th>
                    <th className="py-4 px-4 text-center font-extrabold pb-6">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2a332c]">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-[#26322a]/50 transition-colors group">
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100">{user.fullName}</span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 font-medium text-gray-600 dark:text-gray-300">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'Productor'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-sm text-gray-500 dark:text-gray-400">{user.registrationDate}</td>
                      <td className="py-5 px-4">
                        <span className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                          user.status === 'Active' ? 'text-green-500' : 'text-red-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                          {user.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center border-none cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center border-none cursor-pointer"
                          >
                            <FontAwesomeIcon icon={user.status === 'Active' ? faUserSlash : faUserCheck} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#8dc84b] dark:border-[#6fa33b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium font-outfit">Cargando base de usuarios...</p>
              </div>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-[#1A221C] border-2 border-gray-100 dark:border-[#2a332c] rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] dark:hover:border-[#6fa33b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'Productor'
                        ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                      user.status === 'Active' ? 'text-green-500' : 'text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                      {user.status === 'Active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1" title={user.fullName}>{user.fullName}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 dark:border-[#2a332c]">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Registro</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.registrationDate}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="h-10 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 border-none"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-10 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 border-none"
                    >
                      <FontAwesomeIcon icon={user.status === 'Active' ? faUserSlash : faUserCheck} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-[#2a332c] rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No se encontraron usuarios.</p>
              </div>
            )}
          </div>
        )}

        {/* User Pagination */}
        {totalUserPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setUserPage(p => Math.max(1, p - 1))}
              disabled={userPage === 1}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setUserPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                    userPage === page
                      ? "bg-[#8dc84b] dark:bg-[#6fa33b] text-white shadow-md shadow-[#8dc84b]/30"
                      : "bg-gray-100 dark:bg-[#26322a] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1f2a22]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
              disabled={userPage === totalUserPages}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      {/* Recent Products Section */}
      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Últimos Productos</h2>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="flex bg-gray-100 dark:bg-[#26322a] p-1 rounded-xl">
              <button
                onClick={() => setProductViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  productViewMode === "list"
                    ? "bg-white dark:bg-[#1f2a22] text-[#004d00] dark:text-[#6fa33b]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faListUl} /> Lista
              </button>
              <button
                onClick={() => setProductViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  productViewMode === "grid"
                    ? "bg-white dark:bg-[#1f2a22] text-[#004d00] dark:text-[#6fa33b]"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faBorderAll} /> Tarjetas
              </button>
            </div>
            <Link to="/admin/productos">
              <Button
                text="Ver todos"
                className="bg-[#004d00] text-white rounded-xl py-2 px-6 w-full md:w-auto h-10"
              />
            </Link>
          </div>
        </div>

        {productViewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2a332c] text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 text-left pb-6">Cod</th>
                  <th className="py-4 px-4 text-left pb-6">Producto</th>
                  <th className="py-4 px-4 text-left pb-6">Productor/Categoría</th>
                  <th className="py-4 px-4 text-left pb-6">Precio</th>
                  <th className="py-4 px-4 text-left pb-6">Stock</th>
                  <th className="py-4 px-4 text-left pb-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a332c]">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-[#26322a]/50 transition-colors">
                    <td className="py-5 px-4 font-bold text-gray-400 dark:text-gray-500">#{product.id}</td>
                    <td className="py-5 px-4 font-bold text-gray-800 dark:text-gray-100">{product.name}</td>
                    <td className="py-5 px-4 text-gray-600 dark:text-gray-300 font-medium">{product.producer}</td>
                    <td className="py-5 px-4 font-black text-[#8dc84b] dark:text-[#6fa33b]">${product.price.toLocaleString()}</td>
                    <td className="py-5 px-4 font-bold text-gray-600 dark:text-gray-300">{product.stock} un.</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        product.status === "Aprobado"
                          ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300"
                          : product.status === "Pendiente"
                          ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300"
                          : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No hay productos recientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div key={product.id} className="bg-white dark:bg-[#1A221C] border-2 border-gray-100 dark:border-[#2a332c] rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] dark:hover:border-[#6fa33b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#26322a] flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Sin+Imagen";
                      }}
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
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-[#2a332c] rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">No hay productos recientes.</p>
              </div>
            )}
          </div>
        )}

        {/* Product Pagination */}
        {totalProductPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setProductPage(p => Math.max(1, p - 1))}
              disabled={productPage === 1}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setProductPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                    productPage === page
                      ? "bg-[#8dc84b] dark:bg-[#6fa33b] text-white shadow-md shadow-[#8dc84b]/30"
                      : "bg-gray-100 dark:bg-[#26322a] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1f2a22]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
              disabled={productPage === totalProductPages}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      
      <SendMassEmailModal
        isOpen={isMassEmailOpen}
        onClose={() => setIsMassEmailOpen(false)}
      />
    </div>
  );
};

export default DashboardAdminDesktop;