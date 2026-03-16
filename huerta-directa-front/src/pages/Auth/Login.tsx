import React from "react";
import "./Login.css";
import { Background } from "../../components/GlobalComponents/Background";
import logo from "../../assets/logo_huerta.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowRotateLeft,
  faEnvelope,
  faMobile,
  faMobileScreenButton,
  faRightToBracket,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/GlobalComponents/Button";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PasswordInput } from "../../components/GlobalComponents/PasswordInput";

const Login: React.FC = () => {
  usePageTitle("Login  ");
  const {
    isActive,
    setIsActive,
    error,
    setError,
    success,
    setSuccess,
    registerData,
    loginData,
    requiresChannelSelection,
    hasPhoneChannel,
    requiresEmailVerification,
    emailCode,
    setEmailCode,
    maskedEmail,
    resendCooldown,
    otpSecondsLeft,
    handleRegisterChange,
    handleLoginChange,
    handleRegisterSubmit,
    handleLoginSubmit,
    handleSelectVerificationChannel,
    handleVerifyEmailSubmit,
    handleResendEmailCode,
    cancelEmailVerification,
  } = useAuth();

  const otpMinutes = Math.floor(otpSecondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const otpSeconds = (otpSecondsLeft % 60).toString().padStart(2, "0");

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#FEF5DC] dark:bg-[#1A221C]! font-['Poppins'] relative">
      <Background />

      {/* ALERTAS */}
      {error && (
        <div className="fixed top-5 right-5 bg-[#dc3545] text-white border border-[#dc3545] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(220,53,69,0.2)] flex items-center justify-between">
          <span>{error}</span>
          <Button
            text="×"
            onClick={() => setError(null)}
            className="ml-2 bg-transparent! hover:bg-transparent! hover:scale-100! p-0 text-white!"
          />
        </div>
      )}

      {success && (
        <div className="fixed top-5 right-5 bg-[#52c41a] text-white border border-[#52c41a] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between">
          <span>{success}</span>
          <Button
            text="×"
            onClick={() => setSuccess(null)}
            className="ml-2 bg-transparent! hover:bg-transparent! hover:scale-100! p-0 text-white!"
          />
        </div>
      )}

      <div
        className={`login-container bg-white dark:bg-[#1f2a22]! overflow-hidden rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] ${
          isActive ? "active" : ""
        }`}
        id="container"
      >
        {/* ================= SIGN UP ================= */}
        <div className="form-container sign-up dark:bg-[#1f2a22] ">
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-white dark:bg-[#1f2a22] w-110 flex items-center justify-center flex-col px-10 h-full"
          >
            <h1 className="text-2xl font-bold dark:text-white">Crear cuenta</h1>

            <img src={logo} alt="Logo huerta directa" className="w-20 mb-4" />

            {/* Nombre */}
            <div className="w-full mb-2">
              <label className="text-sm font-normal block dark:text-gray-300">
                Nombre de usuario
              </label>
              <div className="relative flex items-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 text-[#888] dark:text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Ejemplo: Santiago Puentes"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_5px_rgba(0,77,0,0.5)]"
                  required
                />
              </div>
            </div>

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
                  placeholder="Ej: tunombre@correo.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_5px_rgba(0,77,0,0.5)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="w-full mb-2">
              <label className="text-sm font-normal block dark:text-gray-300!">
                Ingrese su contraseña
              </label>

              <PasswordInput
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Contraseña"
                required
              />
            </div>

            <Button
              text="Registrar"
              iconRight={faUserPlus}
              type="submit"
              className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer"
            />
          </form>
        </div>

        {/* ================= SIGN IN ================= */}
        <div className="form-container sign-in dark:bg-[#1f2a22]">
          {requiresChannelSelection ? (
            <form className="bg-white dark:bg-[#1f2a22] w-100 flex items-center justify-center flex-col px-10 h-full">
              <h1 className="text-3xl font-bold mb-2 dark:text-white text-center">
                Elige canal de verificación
              </h1>

              <img src={logo} alt="Logo huerta directa" className="w-20 mb-3" />

              <p className="text-sm text-center text-[#333] dark:text-gray-300 mb-6">
                Selecciona cómo deseas recibir tu código de acceso
              </p>

              <div className="w-full flex flex-col gap-3">
                <Button
                  text="Recibir por correo"
                  iconLetf={faEnvelope}
                  onClick={() => handleSelectVerificationChannel("email")}
                  className="w-full py-3 px-4 rounded-[15px] border-2 border-[#8dc84b] text-[#2e7d32]! dark:hover:text-white! duration-500 font-semibold bg-transparent! hover:bg-[#5aaa37]! hover:text-white!"
                />

                <Button
                  text={`Recibir por sms ${hasPhoneChannel ? "(Próximamente)" : "(No registrado)"}`}
                  iconLetf={faMobile}
                  onClick={() => handleSelectVerificationChannel("sms")}
                  className="w-full py-3 px-4 rounded-[15px] border-2 border-[#a5a2a2] text-[#666]! dark:text-white! dark:hover:bg-red-800! duration-500 font-semibold bg-transparent! hover:bg-red-300! cursor-not-allowed!"
                />
              </div>

              <Button
                text="Cancelar"
                onClick={cancelEmailVerification}
                iconLetf={faArrowLeft}
                className="text-xs px-4 py-2 rounded-xl border border-[#c9c9c9] bg-transparent! hover:bg-gray-400! hover:text-white! text-[#444]! mt-4 dark:text-white! dark:hover:bg-[#444]! dark:hover:text-white!"
              />
            </form>
          ) : requiresEmailVerification ? (
            <form
              onSubmit={handleVerifyEmailSubmit}
              className="bg-white dark:bg-[#1f2a22] w-100 flex items-center justify-center flex-col px-10 h-full"
            >
              <h1 className="text-3xl font-bold mb-2 dark:text-white text-center">
                Verifica tu correo
              </h1>

              <img src={logo} alt="Logo huerta directa" className="w-20 mb-3" />

              <p className="text-sm text-center text-[#333] dark:text-gray-300 mb-3">
                Ingresa el código enviado a
                <span className="font-semibold ml-1">{maskedEmail ?? "tu correo"}</span>
              </p>

              <p className="text-xs text-[#666] dark:text-gray-400 mb-4">
                El código vence en {otpMinutes}:{otpSeconds}
              </p>

              <div className="w-full mb-2">
                <label className="text-sm font-normal block dark:text-gray-300">
                  Código de verificación
                </label>
                <div className="relative flex items-center">
                  <FontAwesomeIcon
                    icon={faMobileScreenButton}
                    className="absolute left-3 text-[#888] dark:text-gray-400"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={emailCode}
                    onChange={(e) =>
                      setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base tracking-[0.35em] text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_8px_rgba(0,77,0,0.4)]"
                    required
                  />
                </div>
              </div>

              <Button
                iconRight={faArrowRight}
                text="Validar código"
                type="submit"
                className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer"
              />

              <div className="flex gap-3 mt-3">
                <Button
                  text={resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : "Reenviar"}
                  onClick={handleResendEmailCode}
                  disabled={resendCooldown > 0}
                  iconLetf={faArrowRotateLeft}
                  className="text-xs px-4 py-2 rounded-xl border border-[#8dc84b] text-[#2e7d32]! bg-transparent! hover:bg-[#8dc84b]! hover:text-white! dark:text-gray-300!"
                />
                <Button
                  text="Cancelar"
                  onClick={cancelEmailVerification}
                  iconLetf={faArrowLeft}
                  className="text-xs px-4 py-2 rounded-xl border border-[#c9c9c9] text-[#444]! bg-transparent! hover:bg-gray-400! hover:text-white! dark:text-gray-300!"
                />
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleLoginSubmit}
              className="bg-white dark:bg-[#1f2a22] w-100 flex items-center justify-center flex-col px-10 h-full "
            >
              <h1 className="text-3xl font-bold mb-4 dark:text-white">
                Iniciar Sesión
              </h1>

              <img src={logo} alt="Logo huerta directa" className="w-20 mb-4" />

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

              <a
                href="/forgot-password"
                className="text-[#333] dark:text-gray-300 text-[13px] no-underline mb-5 hover:text-[#8dc84b] transition-colors duration-500"
              >
                ¿Olvidaste tu contraseña?
              </a>

              <Button iconRight={faArrowRight} text="Ingresar" type="submit"  className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer" />
            </form>
          )}
        </div>

        {/* ================= TOGGLE ================= */}
        <div className="toggle-container ">
          <div className="toggle ">
            <div className="toggle-panel toggle-left ">
              <h1 className="text-4xl font-bold mb-4">
                ¡Bienvenido de vuelta!
              </h1>
              <p className="mb-5">Usa tu información para ingresar</p>
              <Button
                text="Iniciar Sesión"
                iconRight={faRightToBracket}
                onClick={() => setIsActive(false)}
                className="bg-transparent! border border-white text-white! py-3! px-8! rounded-[15px] font-semibold uppercase text-xs tracking-wider cursor-pointer transition-all duration-500 hover:bg-white! hover:text-[#8dc84b]!"
              />
            </div>

            <div className="toggle-panel toggle-right">
              <h1 className="text-4xl font-bold mb-4">¡Hola!</h1>
              <p className="mb-5">
                Regístrate con tu información para ingresar
              </p>
              <Button
                text="Registrar"
                iconRight={faUserPlus}
                onClick={() => setIsActive(true)}
                className="bg-transparent! border border-white text-white! py-3 px-8 rounded-[15px] font-semibold uppercase text-xs tracking-wider cursor-pointer transition-all duration-500 hover:bg-white! hover:text-[#8dc84b]!"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
