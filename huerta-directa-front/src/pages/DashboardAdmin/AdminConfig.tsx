import React, { useState } from "react";
import { faSave, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Button } from "../../components/GlobalComponents/Button";

export const AdminConfig: React.FC = () => {
  usePageTitle("Configuración del Sistema");

  const [commissionRate, setCommissionRate] = useState("5.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveProducers, setAutoApproveProducers] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    nombreCompleto: "Administrador Global",
    email: "admin@huertadirecta.com",
    password: "",
    celular: "+57 300 123 4567",
    direccion: "Carrera 45 # 104-56, Bogotá"
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminProfile({
      ...adminProfile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    alert("Configuraciones guardadas con éxito.");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">
          Configuración Global
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Finanzas */}
        <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100  flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-[#2a332c] pb-4">
            Finanzas
          </h2>

          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              Comisión Plataforma (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Porcentaje que se cobra a los productores por cada venta.
            </p>
          </div>
        </section>

        {/* General */}
        <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100  flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-[#2a332c] pb-4">
            General
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700 dark:text-gray-200">Modo Mantenimiento</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Desactiva el acceso a los usuarios no administradores.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-[#26322a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004d00]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-[#2a332c]">
            <div>
              <p className="font-bold text-gray-700 dark:text-gray-200">Auto-aprobar Productores</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Las solicitudes de nuevos productores no requerirán revisión manual.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoApproveProducers}
                onChange={() => setAutoApproveProducers(!autoApproveProducers)}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-[#26322a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8dc84b]"></div>
            </label>
          </div>
        </section>
      </div>

      {/* Perfil Administrativo */}
      <div className="mt-8">
        <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-[#2a332c] pb-4">
            Mi Perfil Administrativo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombreCompleto" className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                value={adminProfile.nombreCompleto}
                onChange={handleProfileChange}
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 focus:bg-white dark:focus:bg-[#26322a]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={adminProfile.email}
                onChange={handleProfileChange}
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 focus:bg-white dark:focus:bg-[#26322a]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Deja en blanco para no cambiar"
                value={adminProfile.password}
                onChange={handleProfileChange}
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="celular" className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Número de Celular
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={adminProfile.celular}
                onChange={handleProfileChange}
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 focus:bg-white dark:focus:bg-[#26322a]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="direccion" className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Dirección de Vivienda
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={adminProfile.direccion}
                onChange={handleProfileChange}
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 focus:bg-white dark:focus:bg-[#26322a]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-end gap-4 mt-12 bg-white/50 dark:bg-[#1f2a22]/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 dark:border-[#2a332c] shadow-sm sticky bottom-8">
        <Button
          text="Restaurar Valores"
          iconLetf={faRotateLeft}
          className="bg-gray-200 dark:bg-[#26322a] text-gray-600 dark:text-gray-300 rounded-2xl py-4 px-8 shadow-none hover:bg-gray-300 dark:hover:bg-[#1f2a22] transition-all font-bold"
        />
        <Button
          text="Guardar Todas las Configuraciones"
          iconLetf={faSave}
          className="bg-[#8dc84b] dark:bg-[#6fa33b] text-white rounded-2xl py-4 px-10 shadow-xl shadow-[#8dc84b]/20 font-black"
          onClick={handleSave}
        />
      </div>
    </div>
  );
};

export default AdminConfig;