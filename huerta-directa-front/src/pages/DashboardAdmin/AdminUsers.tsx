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
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Button } from "../../components/GlobalComponents/Button";
import { EditUserModal } from "../../components/Modals/EditUserModal";
import { SendMassEmailModal } from "../../components/Modals/SendMassEmailModal";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  registrationDate: string;
  raw?: any;
}

export const AdminUsers: React.FC = () => {
  usePageTitle("Gestión de Usuarios");

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMassEmailOpen, setIsMassEmailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const mappedUsers: UserInfo[] = data.map((u: any) => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role:
              u.idRole === 1
                ? "Administrador"
                : u.idRole === 3
                  ? "Productor"
                  : "Cliente",
            status: "Active",
            registrationDate: u.creacionDate || "N/A",
            raw: u,
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
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditUser = (user: UserInfo) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserInfo) => {
    try {
      const payload = {
        ...updatedUser.raw,
        name: updatedUser.fullName,
        email: updatedUser.email,
        idRole:
          updatedUser.role === "Administrador"
            ? 1
            : updatedUser.role === "Productor"
              ? 3
              : 2,
      };

      const response = await fetch(`${API_URL}/api/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUsers(
          users.map((u) =>
            u.id === updatedUser.id ? { ...updatedUser, raw: updatedData } : u,
          ),
        );
        setIsEditModalOpen(false);
      } else {
        alert("Error al editar el usuario: " + response.statusText);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error de red al actualizar usuario.");
    }
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
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id));
        Swal.fire({
          title: "¡Eliminado!",
          text: "El usuario ha sido eliminado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      } else {
        console.error("Error eliminando usuario");
        Swal.fire({
          title: "Error",
          text: "Error eliminando usuario. Es posible que tenga productos asociados.",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Error de red al eliminar usuario.",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">
          Gestión de Usuarios
        </h1>
      </div>

      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o correo..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500"
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
            <Button
              text="Correos Masivos"
              iconLetf={faEnvelope}
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-3 px-6 h-11.5 shadow-sm transition-all"
              onClick={() => setIsMassEmailOpen(true)}
            />
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#8dc84b] dark:border-[#6fa33b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Cargando usuarios...
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2a332c] text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 text-left pb-6">Usuario</th>
                    <th className="py-4 px-4 text-left pb-6">Rol</th>
                    <th className="py-4 px-4 text-left pb-6">
                      Fecha de Registro
                    </th>
                    <th className="py-4 px-4 text-left pb-6">Estado</th>
                    <th className="py-4 px-4 text-center pb-6">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2a332c]">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#26322a]/50 transition-colors group"
                    >
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            {user.fullName}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 font-medium text-gray-600 dark:text-gray-300">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === "Productor"
                              ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300"
                              : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-sm text-gray-500 dark:text-gray-400">
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
                            className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
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
                        className="py-8 text-center text-gray-500 dark:text-gray-400"
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
                <div className="w-12 h-12 border-4 border-[#8dc84b] dark:border-[#6fa33b] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Cargando usuarios...
                </p>
              </div>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-[#1A221C] border-2 border-gray-100 dark:border-[#2a332c] rounded-3xl p-6 flex flex-col gap-4 hover:border-[#8dc84b] dark:hover:border-[#6fa33b] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === "Productor"
                          ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
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
                      className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1"
                      title={user.fullName}
                    >
                      {user.fullName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {user.email}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 dark:border-[#2a332c]">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Registro
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.registrationDate}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-[#004d00] hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 shadow-sm"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button className="h-11 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer col-span-1 shadow-sm">
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
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-[#2a332c] rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                  No se encontraron usuarios.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                ),
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-[#8dc84b] dark:hover:bg-[#6fa33b] hover:text-white transition-all cursor-pointer"
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
      
      <SendMassEmailModal
        isOpen={isMassEmailOpen}
        onClose={() => setIsMassEmailOpen(false)}
      />
    </div>
  );
};

export default AdminUsers;
