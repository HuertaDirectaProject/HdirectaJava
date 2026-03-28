import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { faUsers, faBoxesStacked, faChartPie } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

export interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  registrationDate: string;
  raw?: any;
}

export interface AdminInsightItem {
  title: string;
  value: string;
  percentage: number;
  footer: string;
  color: "primary" | "secondary" | "accent";
  icon: any;
}

export const useDashboardAdmin = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [productsList, setProductsList] = useState<any[]>([]);

  const [totalSales, setTotalSales] = useState<number>(0);

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
            role: u.idRole === 1 ? "Administrador" : u.idRole === 3 ? "Productor" : "Cliente",
            status: "Active",
            registrationDate: u.creacionDate || "N/A",
            raw: u
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setProductCount(data.length);
          setProductsList(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stats/dashboard/admin`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          const adminStats = data.adminStats || {};
          const monthlySales = adminStats.monthlySales || {};
          const total = Object.values(monthlySales).reduce((acc: number, val: any) => acc + Number(val), 0) as number;
          setTotalSales(total);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchUsers();
    fetchAllProducts();
    fetchStats();
  }, []);

  const adminInsights: AdminInsightItem[] = [
    {
      title: "Usuarios Totales",
      value: users.length.toString(),
      percentage: 12,
      footer: "Más que el mes pasado",
      color: "primary",
      icon: faUsers,
    },
    {
      title: "Productos Activos",
      value: productCount.toString(),
      percentage: 5,
      footer: "Nuevos esta semana",
      color: "secondary",
      icon: faBoxesStacked,
    },
    {
      title: "Ventas Totales",
      value: `$${totalSales.toLocaleString()}`,
      percentage: 18,
      footer: "Crecimiento mensual",
      color: "accent",
      icon: faChartPie,
    },
  ];

  const filteredUsers = users.filter((u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        idRole: updatedUser.role === 'Administrador' ? 1 : updatedUser.role === 'Productor' ? 3 : 2
      };

      const response = await fetch(`${API_URL}/api/users/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Update local state without losing the new updated raw data (we merge it back)
        const updatedData = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? { ...updatedUser, raw: updatedData } : u)));
        setIsEditModalOpen(false);
      } else {
        alert("Error al editar el usuario: " + response.statusText);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error de red al actualizar usuario.");
    }
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
        credentials: "include"
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
      console.error("Error al eliminar usuario:", error);
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

  return {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedUser,
    setSelectedUser,
    productCount,
    adminInsights,
    filteredUsers,
    productsList,
    handleEditUser,
    handleSaveUser,
    handleDeleteUser,
    handleExportExcel,
    handleExportPdf,
  };
};
