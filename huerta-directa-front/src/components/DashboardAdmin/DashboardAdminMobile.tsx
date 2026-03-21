import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUsers,
  faPen,
  faFileExcel,
  faFilePdf,
  faUserSlash,
  faUserCheck,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";
import { EditUserModal } from "../Modals/EditUserModal";
import { useDashboardAdmin } from "../../hooks/useDashboardAdmin";

export const DashboardAdminMobile: React.FC = () => {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    adminInsights,
    filteredUsers,
    handleEditUser,
    handleSaveUser,
    handleExportExcel,
    handleExportPdf,
  } = useDashboardAdmin();

  return (
    <div className="md:hidden w-full pb-24 bg-gray-50 dark:bg-[#1A221C] min-h-screen font-outfit">
      {/* Admin Header */}
      <div className="bg-[#004d00] p-6 rounded-b-[40px] shadow-lg mb-6">
        <h1 className="text-2xl font-black text-white mb-2">Panel Admin</h1>
        <p className="text-white/70 text-sm">Control total del sistema</p>

        {/* Stats Scrollable */}
        <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
          {adminInsights.map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl min-w-[160px] border border-white/20">
              <div className="flex justify-between items-start mb-2">
                <FontAwesomeIcon icon={item.icon} className="text-[#8dc84b]" />
                <span className="text-[#8dc84b] text-[10px] font-bold">+{item.percentage}%</span>
              </div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{item.title}</p>
              <h3 className="text-white text-xl font-black mt-1">{item.value}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* Quick Actions Grid */}
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/admin/usuarios" className="bg-white dark:bg-[#24302A] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#004d00]/10 flex items-center justify-center text-[#004d00] dark:text-[#8dc84b]">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Usuarios</span>
          </Link>
          <Link to="/admin/productos" className="bg-white dark:bg-[#24302A] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#8dc84b]/10 flex items-center justify-center text-[#8dc84b]">
              <FontAwesomeIcon icon={faBoxesStacked} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Productos</span>
          </Link>
        </div>

        {/* User Management */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Gestión Usuarios</h2>
        </div>

        <div className="relative mb-6">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#24302A] rounded-2xl shadow-sm outline-none border-2 border-transparent focus:border-[#8dc84b] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-[#24302A] p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">{user.fullName}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[180px]">{user.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.role === 'Administrador' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-white/5">
                  <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${
                    user.status === 'Active' ? 'text-green-500' : 'text-red-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                    {user.status === 'Active' ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditUser(user)} className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/10 text-[#004d00] dark:text-[#8dc84b] flex items-center justify-center transition-colors"><FontAwesomeIcon icon={faPen} size="xs" /></button>
                    <button className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/10 text-red-400 flex items-center justify-center"><FontAwesomeIcon icon={user.status === 'Active' ? faUserSlash : faUserCheck} size="xs" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={handleExportExcel}
          className="w-12 h-12 bg-[#8dc84b] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          title="Exportar Excel"
        >
          <FontAwesomeIcon icon={faFileExcel} />
        </button>
        <button
          onClick={handleExportPdf}
          className="w-12 h-12 bg-[#004d00] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          title="Reporte General"
        >
          <FontAwesomeIcon icon={faFilePdf} />
        </button>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default DashboardAdminMobile;
