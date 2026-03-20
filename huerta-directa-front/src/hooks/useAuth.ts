import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";


const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRATION_SECONDS = 300;

export const useAuth = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [requiresChannelSelection, setRequiresChannelSelection] = useState(false);
  const [hasPhoneChannel, setHasPhoneChannel] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(OTP_EXPIRATION_SECONDS);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.register(
        registerData.name,
        registerData.email,
        registerData.password
      );

      setSuccess(response.message || "¡Registro exitoso! Redirigiendo...");
      setRegisterData({ name: "", email: "", password: "" });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate("/HomePage");
      }, 1500);
    } catch (err: any) {
      console.error("Error en registro:", err);
      setError(err.message || "Error de conexión con el servidor");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.login(
        loginData.email,
        loginData.password
      );

      if (response.status === "choose-channel") {
        setRequiresChannelSelection(true);
        setRequiresEmailVerification(false);
        setHasPhoneChannel(Boolean(response.hasPhone));
        setMaskedEmail(response.maskedEmail ?? loginData.email);
        setEmailCode("");
        setResendCooldown(0);
        setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
        // ← guardar email para que SMSVerification sepa quién es
        sessionStorage.setItem("pendingPhone", response.phone ?? "");
        setSuccess("Elige el canal para recibir el código");
        return;
      }

      if (response.status === "verify-email") {
        setRequiresChannelSelection(false);
        setRequiresEmailVerification(true);
        setEmailCode("");
        setMaskedEmail(response.maskedEmail ?? loginData.email);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
        setSuccess("Te enviamos un código de verificación al correo");
        return;
      }
      if (response.status === "verify-sms") {
        navigate("/verify-sms");
        return;
      }

      // Login exitoso
      setSuccess(response.message || "¡Login exitoso!");

      // Redirigir según rol
      setTimeout(() => {
        if (response.redirect) {
          navigate(response.redirect);
        } else if (response.idRole === 1) {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Error en login:", err);
      setError(err.message || "Error al iniciar sesión");
    }
  };

  const handleSelectVerificationChannel = async (channel: "email" | "sms") => {
    setError(null);
    setSuccess(null);

    if (channel === "sms") {
      navigate("/verify-sms");
      return;
    }

    try {
      const response = await authService.startVerificationChannel("email");
      if (response.status === "verify-email") {
        setRequiresChannelSelection(false);
        setRequiresEmailVerification(true);
        setMaskedEmail(response.maskedEmail ?? maskedEmail);
        setEmailCode("");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
        setSuccess(response.message || "Código enviado al correo");
      }
    } catch (err: any) {
      console.error("Error iniciando verificación:", err);
      setError(err.message || "No se pudo iniciar la verificación");
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyEmailCode(emailCode);
      setRequiresChannelSelection(false);
      setRequiresEmailVerification(false);
      setEmailCode("");
      setMaskedEmail(null);
      setResendCooldown(0);
      setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
      setSuccess(response.message || "¡Login exitoso!");

      setTimeout(() => {
        if (response.redirect) {
          navigate(response.redirect);
        } else if (response.idRole === 1) {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Error verificando código:", err);
      setError(err.message || "Código inválido");
    }
  };

  const handleResendEmailCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await authService.resendEmailCode();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
      setSuccess("Código reenviado al correo");
    } catch (err: any) {
      console.error("Error reenviando código:", err);
      setError(err.message || "No se pudo reenviar el código");
    }
  };

  const cancelEmailVerification = () => {
    setRequiresChannelSelection(false);
    setRequiresEmailVerification(false);
    setHasPhoneChannel(false);
    setEmailCode("");
    setMaskedEmail(null);
    setResendCooldown(0);
    setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
    setSuccess(null);
  };

  useEffect(() => {
    if (!requiresEmailVerification) {
      return;
    }

    const interval = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [requiresEmailVerification]);

  return {
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
  };
};