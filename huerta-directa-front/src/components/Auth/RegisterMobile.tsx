import logo from "../../assets/logo_huerta.png";
import { useAuth } from "../../hooks/useAuth";
import { PasswordInput } from "../GlobalComponents/PasswordInput";
import { Background } from "../GlobalComponents/Background";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../GlobalComponents/Button";

export const RegisterMobile = () => {
  const {
    registerData,
    handleRegisterChange,
    handleRegisterSubmit,
    error,
    setError,
    success,
    setSuccess,
  } = useAuth();

  return (
    <div className="md:hidden flex items-center justify-center min-h-screen px-6 relative text-white bg-[#1A221C]">
      <Background />

      {/* ALERTAS (las mismas que login) */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#dc3545] text-white p-3 rounded-xl flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#52c41a] text-white p-3 rounded-xl flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <main className="relative z-10 w-full max-w-105">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <img src={logo} className="w-24 mb-3" />
          <h1 className="text-3xl font-bold">Huerta Directa</h1>
          <p className="text-white/60 text-sm mt-2 text-center">
            Del campo a tu mesa digital
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Crear Cuenta</h2>

            {/* USERNAME */}
            <div>
              <label className="text-sm">Nombre de usuario</label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Tu nombre"
                  className="w-full pl-10 p-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm">Correo electrónico</label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="correo@email.com"
                  className="w-full pl-10 p-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <PasswordInput
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              placeholder="Contraseña"
              required
            />

            {/* BOTÓN */}
            <Button
              text="Registrar"
              type="submit"
              className="w-full py-3 bg-linear-to-r from-[#3e6a00] to-[#8dc84b] rounded-xl font-bold"
            />

            {/* LINK */}
            <p className="text-center text-sm text-white/60">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-[#8dc84b] font-semibold">
                Iniciar sesión
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};
