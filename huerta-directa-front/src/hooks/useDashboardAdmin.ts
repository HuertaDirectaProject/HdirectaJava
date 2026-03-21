import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { faUsers, faBoxesStacked, faChartPie } from "@fortawesome/free-solid-svg-icons";

export interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  registrationDate: string;
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`);
        if (response.ok) {
          const data = await response.json();
          const mappedUsers: UserInfo[] = data.map((u: any) => ({
            id: u.id,
            fullName: u.name,
            email: u.email,
            role: u.idRole === 1 ? "Administrador" : "Usuario",
            status: "Active",
            registrationDate: u.creacionDate || "N/A"
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProductCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchAllProducts();
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
      value: "$125,400",
      percentage: 18,
      footer: "Crecimiento mensual",
      color: "accent",
      icon: faChartPie,
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    window.location.href = `/api/users/exportExcel?${params.toString()}`;
  };

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append("dato", "name_user");
      params.append("valor", searchTerm);
    }
    window.location.href = `/api/users/exportPdf?${params.toString()}`;
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
    handleEditUser,
    handleSaveUser,
    handleExportExcel,
    handleExportPdf,
  };
};
