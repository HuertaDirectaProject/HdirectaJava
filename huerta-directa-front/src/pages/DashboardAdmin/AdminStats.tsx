import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillTrendUp,
  faUsersViewfinder,
  faUserShield,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { API_URL } from "../../config/api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const AdminStats: React.FC = () => {
  usePageTitle("Estadísticas Globales");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stats/dashboard/admin`, { credentials: "include" });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d00]"></div>
      </div>
    );
  }

  const adminData = data?.adminStats || {};
  const totalUsers = Object.values(adminData.rolesCount || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;
  const totalRevenue = (adminData.revenueTrends || []).reduce((a: any, b: any) => a + Number(b.revenue), 0) as number;
  const totalProducts = Object.values(adminData.categoryCount || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;

  const stats = [
    { title: "Ingresos Totales", value: `$${totalRevenue.toLocaleString()}`, increment: "Global", icon: faMoneyBillTrendUp, color: "text-[#004d00]", bg: "bg-[#e8f5e9]" },
    { title: "Usuarios Totales", value: totalUsers.toString(), increment: "Registrados", icon: faUsersViewfinder, color: "text-[#8dc84b]", bg: "bg-[#ddfacc]" },
    { title: "Productos", value: totalProducts.toString(), increment: "Catalogo", icon: faBoxesStacked, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Roles", value: Object.keys(adminData.rolesCount || {}).length.toString(), increment: "Tipos", icon: faUserShield, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? "#e2e8f0" : "#475569",
          font: { family: "Inter", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f8fafc" : "#1e293b",
        bodyColor: isDark ? "#94a3b8" : "#475569",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        borderWidth: 1,
      }
    }
  };

  const userData = {
    labels: Object.keys(adminData.monthlyUserRegistrations || {}),
    datasets: [
      {
        label: "Nuevos Usuarios",
        data: Object.values(adminData.monthlyUserRegistrations || {}),
        backgroundColor: "rgba(141, 200, 75, 0.8)",
        borderColor: "#8dc84b",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "#8dc84b",
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(adminData.categoryCount || {}),
    datasets: [
      {
        data: Object.values(adminData.categoryCount || {}),
        backgroundColor: ["#004d00", "#8dc84b", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-[#8dc84b]">Estadísticas Globales</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">{stat.title}</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stat.value}</h3>
                <span className="text-[10px] font-bold text-gray-400 mb-1">{stat.increment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Registros de Usuarios</h2>
          <div className="flex-1">
            <Bar data={userData} options={commonOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Productos por Categoría</h2>
          <div className="flex-1">
            <Doughnut data={categoryData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
