import logo from "../../assets/logo_huerta.png";
import { useAuth } from "../../hooks/useAuth";
import { PasswordInput } from "../../components/GlobalComponents/PasswordInput";
import { Background } from "../GlobalComponents/Background";
import { faArrowRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../GlobalComponents/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export const LoginMobile = () => {
  const {
    loginData,
    handleLoginChange,
    handleLoginSubmit,

    requiresChannelSelection,
    requiresEmailVerification,
    emailCode,
    setEmailCode,
    maskedEmail,
    resendCooldown,
    otpSecondsLeft,

    handleSelectVerificationChannel,
    handleVerifyEmailSubmit,
    handleResendEmailCode,
    cancelEmailVerification,

    error,
    setError,
    success,
    setSuccess,
  } = useAuth();

  const otpMinutes = Math.floor(otpSecondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const otpSeconds = (otpSecondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="md:hidden flex items-center justify-center min-h-screen px-6 relative text-white bg-[#1A221C]">
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

      <main className="relative z-10 w-full max-w-105">
        {/* logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={logo} className="w-24 mb-3" />
          <h1 className="text-3xl font-bold">Huerta Directa</h1>
          <p className="text-white/60 text-lg mt-2 text-center">
            Del campo a tu mesa digital
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* ================= SELECT CHANNEL ================= */}
          {requiresChannelSelection && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-center">
                Selecciona verificación
              </h2>

              <button
                onClick={() => handleSelectVerificationChannel("email")}
                className="w-full py-3 rounded-xl bg-[#8dc84b] text-black font-semibold"
              >
                Recibir por correo
              </button>

              <button
                onClick={cancelEmailVerification}
                className="w-full py-3 rounded-xl border border-white/30"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* ================= VERIFY EMAIL ================= */}
          {requiresEmailVerification && (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-center">
                Verifica tu correo
              </h2>

              <p className="text-sm text-center text-white/60">
                Código enviado a {maskedEmail}
              </p>

              <p className="text-xs text-center text-white/40">
                Expira en {otpMinutes}:{otpSeconds}
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={emailCode}
                onChange={(e) =>
                  setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full p-4 text-center text-lg tracking-widest rounded-xl bg-white/5 outline-none"
                placeholder="000000"
                required
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#8dc84b] text-black font-bold"
              >
                Verificar
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResendEmailCode}
                className="w-full text-sm text-[#8dc84b]"
              >
                {resendCooldown > 0
                  ? `Reenviar en ${resendCooldown}s`
                  : "Reenviar código"}
              </button>
            </form>
          )}

          {/* ================= LOGIN ================= */}
          {!requiresChannelSelection && !requiresEmailVerification && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-center tracking-tight">
                Iniciar Sesión
              </h2>

              {/* Email */}
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
                    placeholder="Correo electrónico"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_8px_rgba(0,77,0,0.4)]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="w-full mb-2">
                <label className="text-sm font-normal block dark:text-gray-300">
                  Ingrese su contraseña
                </label>

                <PasswordInput
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Contraseña"
                  required
                />
              </div>
              <div className="flex flex-col justify-center items-center"> 

              <a
                href="/forgot-password"
                className="text-[#333] dark:text-gray-300 text-[13px] no-underline mb-1 hover:text-[#8dc84b] transition-colors duration-500"
              >
                ¿Olvidaste tu contraseña?
              </a>

              <Button
                iconRight={faArrowRight}
                text="Ingresar"
                type="submit"
                className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer"
              />
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
