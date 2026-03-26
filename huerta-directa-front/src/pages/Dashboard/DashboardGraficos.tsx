import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartLine, 
  faBoxesStacked, 
  faTags,
  faScaleUnbalanced
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

export const DashboardGraficos: React.FC = () => {
  usePageTitle("Gráficos y Estadísticas");
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
        const response = await fetch(`${API_URL}/api/stats/dashboard/client`, { credentials: "include" });
        if (response.ok) {
          const json = await response.json();
          setData(json.clientStats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dc84b]"></div>
      </div>
    );
  }

  const clientData = data || {};
  const totalProducts = Object.values(clientData.myCategoryCount || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;
  const categoriesCount = Object.keys(clientData.myCategoryCount || {}).length;
  const unitsCount = Object.keys(clientData.myUnitCount || {}).length;

  const stats = [
    { title: "Total Productos", value: totalProducts.toString(), change: "En catálogo", trend: "up", icon: faBoxesStacked, color: "bg-green-500" },
    { title: "Categorías", value: categoriesCount.toString(), change: "Diferentes", trend: "up", icon: faTags, color: "bg-blue-500" },
    { title: "Unidades", value: unitsCount.toString(), change: "De medida", trend: "up", icon: faScaleUnbalanced, color: "bg-orange-500" },
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
          padding: 20
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f8fafc" : "#1e293b",
        bodyColor: isDark ? "#94a3b8" : "#475569",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true
      }
    }
  };

  const chartOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? "#94a3b8" : "#64748b" },
      },
      y: {
        grid: { 
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          drawBorder: false
        },
        ticks: { 
          color: isDark ? "#94a3b8" : "#64748b",
          stepSize: 1
        },
      },
    },
  };

  const categoryData = {
    labels: Object.keys(clientData.myCategoryCount || {}),
    datasets: [
      {
        label: "Productos",
        data: Object.values(clientData.myCategoryCount || {}),
        backgroundColor: "rgba(141, 200, 75, 0.8)",
        borderColor: "#8dc84b",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "#8dc84b",
      },
    ],
  };

  const unitData = {
    labels: Object.keys(clientData.myUnitCount || {}),
    datasets: [
      {
        data: Object.values(clientData.myUnitCount || {}),
        backgroundColor: [
          "#8dc84b", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? "#1e1e1e" : "#ffffff",
        hoverOffset: 15
      },
    ],
  };

  return (
    <div className="w-full h-[calc(105vh-100px)] flex flex-col gap-8 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#8dc84b] text-white flex items-center justify-center shadow-lg shadow-[#8dc84b]/20">
          <FontAwesomeIcon icon={faChartLine} size="lg" />
        </div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Gráficos y Estadísticas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col gap-4 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 py-1 px-3 rounded-full">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">{stat.title}</p>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-white/10 h-112.5 flex flex-col">
          <h3 className="text-gray-800 dark:text-white font-bold text-xl mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#8dc84b] rounded-full"></span>
            Productos por Categoría
          </h3>
          <div className="flex-1 min-h-0">
            {categoriesCount > 0 ? (
              <Bar data={categoryData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">No hay datos disponibles</div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[40px] shadow-sm border border-gray-100 dark:border-white/10 h-112.5 flex flex-col">
          <h3 className="text-gray-800 dark:text-white font-bold text-xl mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Distribución por Unidades
          </h3>
          <div className="flex-1 min-h-0">
            {unitsCount > 0 ? (
              <Doughnut data={unitData} options={commonOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">No hay datos disponibles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardGraficos;
