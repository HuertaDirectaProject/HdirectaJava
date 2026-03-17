import logo from "../../assets/logo_huerta.png";
import { useAuth } from "../../hooks/useAuth";
import { PasswordInput } from "../../components/GlobalComponents/PasswordInput";

const LoginMobile = () => {

  const {
    loginData,
    handleLoginChange,
    handleLoginSubmit,
  } = useAuth();

  return (
    <div className="md:hidden flex items-center justify-center min-h-screen px-6 relative text-white bg-[#1A221C]">

      {/* blobs */}
      <div className="absolute w-100 h-100 bg-[#3e6a00] rounded-full blur-[80px] -top-20 -left-20 opacity-30"></div>
      <div className="absolute w-75 h-75 bg-[#8dc84b] rounded-full blur-[80px] bottom-0 right-0 opacity-20"></div>

      <main className="relative z-10 w-full max-w-105">

        {/* logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#8dc84b]/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
            <img src={logo} className="w-10" />
          </div>

          <h1 className="text-3xl font-extrabold">Huerta Directa</h1>
          <p className="text-white/60 text-sm mt-2">
            Del campo a tu mesa digital
          </p>
        </div>

        {/* glass card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

          <h2 className="text-2xl font-bold text-center mb-8">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLoginSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-xs text-white/70 uppercase">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full mt-2 p-4 rounded-xl bg-white/5 text-white outline-none focus:ring-2 focus:ring-[#8dc84b]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/70 uppercase">
                Contraseña
              </label>

              <PasswordInput
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-linear-to-r from-[#3e6a00] to-[#8dc84b] font-bold"
            >
              Entrar →
            </button>

          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            ¿No tienes cuenta? <span className="text-[#8dc84b]">Registrar</span>
          </p>

        </div>
      </main>
    </div>
  );
};

export default LoginMobile;