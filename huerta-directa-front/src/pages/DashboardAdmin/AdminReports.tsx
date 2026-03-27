import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf, faDownload } from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Button } from "../../components/GlobalComponents/Button";

interface ReportInfo {
  id: string;
  date: string;
  type: string;
  amount: number;
}

export const AdminReports: React.FC = () => {
  usePageTitle("Reportes de Ventas");

  const [reports] = useState<ReportInfo[]>([
    { id: "REP-001", date: "2024-03-01", type: "Venta Mayorista", amount: 45000 },
    { id: "REP-002", date: "2024-03-02", type: "Suscripción", amount: 15000 },
    { id: "REP-003", date: "2024-03-03", type: "Venta Minorista", amount: 3500 },
    { id: "REP-004", date: "2024-03-04", type: "Venta Mayorista", amount: 125000 },
  ]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">
          Reportes de Ventas
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Excel card */}
        <div className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100  flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center text-3xl mb-4">
            <FontAwesomeIcon icon={faFileExcel} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Reporte Mensual General
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Descargar el desglose completo de transacciones en formato .xlsx
          </p>
          <Button
            text="Descargar Excel"
            iconLetf={faDownload}
            className="bg-[#8dc84b] dark:bg-[#6fa33b] text-white rounded-xl py-3 w-full"
          />
        </div>

        {/* PDF card */}
        <div className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center text-3xl mb-4">
            <FontAwesomeIcon icon={faFilePdf} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Resumen Ejecutivo
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Descargar el resumen para stakeholders en formato .pdf
          </p>
          <Button
            text="Descargar PDF"
            iconLetf={faDownload}
            className="bg-[#004d00] text-white rounded-xl py-3 w-full"
          />
        </div>
      </div>

      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100 ">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Últimas Transacciones Registradas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a332c] text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-4 text-left pb-6">ID Reporte</th>
                <th className="py-4 px-4 text-left pb-6">Fecha</th>
                <th className="py-4 px-4 text-left pb-6">Tipo</th>
                <th className="py-4 px-4 text-left pb-6">Monto</th>
                <th className="py-4 px-4 text-center pb-6">Archivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#2a332c]">
              {reports.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-[#26322a]/50 transition-colors"
                >
                  <td className="py-5 px-4 font-bold text-gray-800 dark:text-gray-100">
                    {rep.id}
                  </td>
                  <td className="py-5 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {rep.date}
                  </td>
                  <td className="py-5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                    {rep.type}
                  </td>
                  <td className="py-5 px-4 font-bold text-[#8dc84b] dark:text-[#6fa33b]">
                    ${rep.amount.toLocaleString()}
                  </td>
                  <td className="py-5 px-4 text-center">
                    <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#26322a] text-gray-400 dark:text-gray-500 hover:bg-[#004d00] hover:text-white transition-all cursor-pointer">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminReports;