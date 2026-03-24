import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPen,
  faUserSlash,
  faUserCheck,
  faFileExcel,
  faFilePdf,
  faListUl,
  faBorderAll,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Button } from "../../components/GlobalComponents/Button";
import { EditUserModal } from "../../components/Modals/EditUserModal";
import { API_URL } from "../../config/api";

interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  registrationDate: string;
}

export const AdminUsers: React.FC = () => {
  usePageTitle("Gestión de Usuarios");

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          const mappedUsers: UserInfo[] = data.map((u: any) => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role: u.idRole === 1 ? "Administrador" : "Usuario",
            status: "Active",
            registrationDate: u.creacionDate || "N/A",
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditUser = (user: UserInfo) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = (updatedUser: UserInfo) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setIsEditModalOpen(false);
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("dato", "name_user");
      params.append("valor", searchTerm);
    }
    window.location.href = `${API_URL}/api/users/exportExcel?${params.toString()}`;
  };

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("dato", "name_user");
      params.append("valor", searchTerm);
    }
    window.location.href = `${API_URL}/api/users/exportPdf?${params.toString()}`;
  };
  const handleDeleteUser = async (id: number) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include", // importante si usas sesión
      });

      if (response.ok) {
        // 🔥 actualizar estado (quitar usuario del front)
        setUsers(users.filter((u) => u.id !== id));
      } else {
        console.error("Error eliminando usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00]">
          Gestión de Usuarios
        </h1>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o correo..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-[#8dc84b] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-[#004d00] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FontAwesomeIcon icon={faListUl} /> Lista
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-[#004d00] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FontAwesomeIcon icon={faBorderAll} /> Tarjetas
              </button>
            </div>
            <Button
              text="Exportar Excel"
              iconLetf={faFileExcel}
              className="bg-[#8dc84b] text-white rounded-xl py-3 px-6 h-11.5"
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

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">
                  Cargando usuarios...
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 text-left pb-6">Usuario</th>
                    <th className="py-4 px-4 text-left pb-6">Rol</th>
                    <th className="py-4 px-4 text-left pb-6">
                      Fecha de Registro
                    </th>
                    <th className="py-4 px-4 text-left pb-6">Estado</th>
                    <th className="py-4 px-4 text-center pb-6">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {user.fullName}
                          </span>
                          <span className="text-sm text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 font-medium text-gray-600">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === "Productor"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-sm text-gray-500">
                        {user.registrationDate}
                      </td>
                      <td className="py-5 px-4">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                            user.status === "Active"
                              ? "text-green-500"
                              : "text-red-400"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-red-400"}`}
                          />
                          {user.status === "Active" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            <FontAwesomeIcon icon={faUserSlash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500"
                      >
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">
                  Cargando usuarios...
                </p>
              </div>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border-2 border-gray-100 rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === "Productor"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                        user.status === "Active"
                          ? "text-green-500"
                          : "text-red-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-red-400"}`}
                      />
                      {user.status === "Active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-xl font-bold text-gray-800 line-clamp-1"
                      title={user.fullName}
                    >
                      {user.fullName}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Registro
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {user.registrationDate}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="h-11 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 shadow-sm"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="h-11 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 shadow-sm">
                      <FontAwesomeIcon
                        icon={
                          user.status === "Active" ? faUserSlash : faUserCheck
                        }
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <p className="text-gray-500 font-medium text-lg">
                  No se encontraron usuarios.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-[#8dc84b] hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                    currentPage === page ? "bg-[#8dc84b] text-white shadow-md shadow-[#8dc84b]/30" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-[#8dc84b] hover:text-white transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default AdminUsers;
