import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faUserPlus, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Button } from "../../components/GlobalComponents/Button";
import authService from "../../services/authService";

export const AdminRegister: React.FC = () => {
  usePageTitle("Registrar Administrador");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
    rolNivel: "Nivel 1 (Básico)",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.registerAdmin(
        formData.nombreCompleto.trim(),
        formData.email.trim(),
        formData.password
      );
      setSuccessMessage(response.message || `Administrador ${response.name} registrado con éxito.`);
      setFormData({ nombreCompleto: "", email: "", password: "", confirmPassword: "", rolNivel: "Nivel 1 (Básico)" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar el administrador");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#004d00] dark:text-white">
          Registrar Administrador
        </h1>
      </div>

      <section className="bg-white dark:bg-[#1f2a22] p-8 rounded-3xl shadow-sm border border-gray-100  max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-[#2a332c]">
          <div className="w-14 h-14 rounded-2xl bg-[#004d00] dark:bg-[#6fa33b] text-white flex items-center justify-center text-2xl shadow-lg shadow-green-900/20">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Nuevo Perfil Administrativo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Crea una nueva cuenta con privilegios de gestión global.
            </p>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombreCompleto" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Correo Electrónico Corp.
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@huertadirecta.com"
                className="w-full p-4 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Contraseña Segura
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-4 pr-12 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#20571b] dark:hover:text-[#6fa33b]"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-4 pr-12 border-2 border-gray-100 dark:border-[#2a332c] rounded-xl outline-none focus:border-[#8dc84b] dark:focus:border-[#6fa33b] transition-all bg-gray-50 dark:bg-[#26322a] dark:text-gray-100 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#26322a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#20571b] dark:hover:text-[#6fa33b]"
                  aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-[#2a332c]">
            <Button
              text="Registrar administrador"
              iconLetf={faUserPlus}
              className="bg-[#8dc84b] dark:bg-[#6fa33b] text-white py-4 px-8 rounded-xl text-lg w-full md:w-auto hover:bg-[#7ab13e]"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Registrando..."
            />
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminRegister;