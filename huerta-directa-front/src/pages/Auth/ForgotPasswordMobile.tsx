import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo_huerta.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPaperPlane,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../../services/authService";
import { Background } from "../../components/GlobalComponents/Background";
import { Button } from "../../components/GlobalComponents/Button";

export const ForgotPasswordMobile = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "No fue posible procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:hidden flex items-center justify-center min-h-screen px-6 relative text-black dark:text-white bg-[#FEF5DC] dark:bg-[#1A221C]">
      <Background />

      {/* ALERTAS */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#dc3545] text-white p-3 rounded-xl flex justify-between shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#52c41a] text-white p-3 rounded-xl flex justify-between shadow-lg">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <main className="relative z-10 w-full max-w-105">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <img src={logo} className="w-24 mb-3" />
          <h1 className="text-3xl font-bold">Huerta Directa</h1>
          <p className="text-black/70 dark:text-white/60 text-sm mt-2 text-center">
            Recupera el acceso a tu cuenta
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Recuperar contraseña
            </h2>

            <p className="text-sm text-black/70 dark:text-white/60 text-center">
              Te enviaremos un correo para restablecer tu contraseña
            </p>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-black/80 dark:text-white/70">
                Correo electrónico
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@email.com"
                  className="w-full pl-10 p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-black/20 dark:border-white/10 outline-none text-black dark:text-white placeholder-black/50 dark:placeholder-white/30 focus:border-[#8dc84b] focus:ring-2 focus:ring-[#8dc84b]/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* BOTÓN */}
            <Button
              text={isSubmitting ? "Enviando..." : "Enviar recuperación"}
              iconRight={faPaperPlane}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#8dc84b] text-white rounded-xl font-bold shadow-lg hover:bg-[#004d00] transition-all"
            />

            {/* LINK */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-black/70 dark:text-white/60 hover:text-[#8dc84b] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Volver al inicio de sesión
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
};