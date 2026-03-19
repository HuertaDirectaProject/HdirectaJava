import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo_huerta.png";
import hero from "../../assets/hero.jpg";

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
  <div className="md:hidden flex justify-center min-h-screen relative text-black dark:text-white dark:bg-[#1A221C]">
    <Background />

    {/* ALERTAS */}
    {error && (
      <div className="fixed top-5 right-5 bg-[#dc3545] text-white border border-[#dc3545] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(220,53,69,0.2)] flex items-center justify-between">
        <span>{error}</span>
        <button onClick={() => setError(null)} className="ml-2">
          ×
        </button>
      </div>
    )}

    {success && (
      <div className="fixed top-5 right-5 bg-[#52c41a] text-white border border-[#52c41a] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between">
        <span>{success}</span>
        <button onClick={() => setSuccess(null)} className="ml-2">
          ×
        </button>
      </div>
    )}

    <main className="relative z-10 w-full">
      {/* HERO */}
      <div className="relative w-full h-75 overflow-hidden hero-clip">
        <img
          src={hero}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#3e6a00]/90 to-[#8dc84b]/70" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <img src={logo} className="w-20 mb-3" />

          <h1 className="text-white text-3xl font-extrabold">
            Huerta Directa
          </h1>
         
          <p className="text-white/90 text-sm mb-10">
            Recupera el acceso a tu cuenta
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className="dark:bg-white/10 bg-white backdrop-blur-xl border max-w-xs mx-auto border-white/10 rounded-3xl px-4 py-6 -mt-15">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          
          <div className="text-2xl font-bold text-center tracking-tight">
            <h2>Recuperar contraseña</h2>
            <p className="text-sm dark:text-white/70 text-black/60">
              Te enviaremos un correo para restablecer tu contraseña
            </p>
          </div>

          {/* EMAIL */}
          <div className="w-full mb-2">
            <label className="text-sm font-normal block dark:text-gray-300">
              Ingrese su correo electrónico
            </label>

            <div className="relative flex items-center">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-3 text-[#888] dark:text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_8px_rgba(0,77,0,0.4)]"
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
            className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer"
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
