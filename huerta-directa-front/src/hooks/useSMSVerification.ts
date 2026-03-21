import { useState } from "react";
import { auth } from "../config/firebase";
import type { ConfirmationResult } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const useSMSVerification = (phone: string) => {
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const formatPhone = (phone: string) => {
        const clean = phone.replace(/\D/g, "");
        return clean.startsWith("57") ? `+${clean}` : `+57${clean}`;
    };

    const initRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
        const container = document.getElementById("recaptcha-container");
        if (!container) throw new Error("recaptcha-container no encontrado");
        
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
            auth,
            container,  // ← elemento DOM, no string
            { size: "normal" }
        );
    }
    return (window as any).recaptchaVerifier;
  };

    const sendSMS = async () => {
        try {
            setLoading(true);
            setError(null);
            const verifier = initRecaptcha();
            const result = await signInWithPhoneNumber(auth, formatPhone(phone), verifier);
            setConfirmationResult(result);
        } catch (err: any) {
            setError("Error enviando SMS: " + err.code);
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async (code: string) => {
        if (!confirmationResult) {
            setError("No se ha enviado el código");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            await confirmationResult.confirm(code);

            // Completar login en el backend
            const response = await fetch(`${API_BASE}/api/login/complete-sms`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                setError("Error completando login");
            }
        } catch (err: any) {
            setError("Código incorrecto, intenta de nuevo");
        } finally {
            setLoading(false);
        }
    };

    return { sendSMS, verifyCode, loading, error, success };
};