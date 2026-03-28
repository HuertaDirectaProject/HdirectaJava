import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFilter,
  faHourglassHalf,
  faMoneyBillTrendUp,
  faReceipt,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import orderService, { type OrderRow, type OrderStatus } from "../../services/orderService";
import { API_URL } from "../../config/api";

const statusStyles: Record<OrderStatus, string> = {
  completed: "bg-[#dff4d6] text-[#3f7d20]",
  pending: "bg-[#ffe7d2] text-[#b35b00]",
  canceled: "bg-[#ffd6d6] text-[#b42318]",
};

const statusLabel: Record<OrderStatus, string> = {
  completed: "Completada",
  pending: "Pendiente",
  canceled: "Cancelada",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const DashboardOrders = () => {
  usePageTitle("Mis Ordenes");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    avgTicket: 0,
  });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await orderService.getMyOrders();
        setOrders(data.orders);
        setSummary(data.summary);
      } catch (loadError) {
        console.error(loadError);
        setError("No pudimos cargar tus ordenes por ahora.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.buyer.toLowerCase().includes(q) ||
        order.product.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleExportCsv = () => {
    const header = ["N Orden", "Usuario", "Producto", "Fecha", "Monto", "Estado"];
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.buyer,
      order.product,
      formatDate(order.date),
      String(order.amount),
      statusLabel[order.status],
    ]);

    const csvData = [header, ...rows]
      .map((row) => row.map((col) => `"${String(col).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ordenes_huerta_directa.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    window.location.href = `${API_URL}/api/payments/exportPdf?${params.toString()}`;
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Ordenes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Ventas realizadas sobre tus productos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-[#5a8f08] hover:bg-[#4e7d06] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-[#2f6b0e] hover:bg-[#245509] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            PDF
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-[#f2eddc] hover:bg-[#ece4cd] text-[#645d47] font-bold text-sm transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filtros avanzados
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="bg-white dark:bg-[#1A221C] border border-gray-100 dark:border-[#24302A] rounded-3xl p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Ordenes totales</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{summary.totalOrders}</p>
            <FontAwesomeIcon icon={faReceipt} className="text-[#8dc84b] text-xl" />
          </div>
        </article>

        <article className="bg-white dark:bg-[#1A221C] border border-gray-100 dark:border-[#24302A] rounded-3xl p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Ventas totales</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{formatCurrency(summary.totalSales)}</p>
            <FontAwesomeIcon icon={faMoneyBillTrendUp} className="text-[#8dc84b] text-xl" />
          </div>
        </article>

        <article className="bg-white dark:bg-[#1A221C] border border-gray-100 dark:border-[#24302A] rounded-3xl p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Pendientes</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{summary.pendingOrders}</p>
            <FontAwesomeIcon icon={faHourglassHalf} className="text-[#f59e0b] text-xl" />
          </div>
        </article>

        <article className="bg-white dark:bg-[#1A221C] border border-gray-100 dark:border-[#24302A] rounded-3xl p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Ticket promedio</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{formatCurrency(summary.avgTicket)}</p>
            <FontAwesomeIcon icon={faTicket} className="text-[#8dc84b] text-xl" />
          </div>
        </article>
      </div>

      <section className="bg-white dark:bg-[#1A221C] border border-gray-100 dark:border-[#24302A] rounded-3xl p-5 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Listado de ordenes</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar orden, cliente o producto..."
              className="min-w-72 px-4 py-2 rounded-xl border-2 border-gray-100 dark:border-[#24302A] bg-white dark:bg-[#111712] text-gray-800 dark:text-white focus:outline-none focus:border-[#8dc84b]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
              className="px-4 py-2 rounded-xl border-2 border-gray-100 dark:border-[#24302A] bg-white dark:bg-[#111712] text-gray-800 dark:text-white focus:outline-none focus:border-[#8dc84b]"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completada</option>
              <option value="pending">Pendiente</option>
              <option value="canceled">Cancelada</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-semibold">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-[#24302A] rounded-2xl">
            <p className="text-gray-500 dark:text-gray-300 font-semibold">No hay ordenes para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-210">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-[#24302A] text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-3">N Orden</th>
                  <th className="py-3 px-3">Usuario/Cliente</th>
                  <th className="py-3 px-3">Producto</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Monto</th>
                  <th className="py-3 px-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={`${order.paymentId}-${order.product}-${order.quantity}`} className="border-b border-gray-50 dark:border-[#24302A] hover:bg-gray-50/60 dark:hover:bg-[#111712]">
                    <td className="py-4 px-3 text-[#b45309] font-bold">{order.orderNumber}</td>
                    <td className="py-4 px-3 text-gray-700 dark:text-gray-300 font-semibold">{order.buyer}</td>
                    <td className="py-4 px-3 text-gray-700 dark:text-gray-300">{order.product} <span className="text-xs text-gray-400">x{order.quantity}</span></td>
                    <td className="py-4 px-3 text-gray-600 dark:text-gray-400">{formatDate(order.date)}</td>
                    <td className="py-4 px-3 text-gray-800 dark:text-white font-black">{formatCurrency(order.amount)}</td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-black ${statusStyles[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default DashboardOrders;
