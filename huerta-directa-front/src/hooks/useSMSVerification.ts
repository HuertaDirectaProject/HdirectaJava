import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import type { ConfirmationResult } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const useSMSVerification = (phone: string) => {
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ← Limpiar el verifier cuando el componente se desmonta
    useEffect(() => {
        return () => {
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        };
    }, []);

    const formatPhone = (phone: string) => {
        const clean = phone.replace(/\D/g, "");
        return clean.startsWith("57") ? `+${clean}` : `+57${clean}`;
    };

    const initRecaptcha = () => {
        // Si existe pero ya fue usado, limpiar primero
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch (e) {}
            (window as any).recaptchaVerifier = null;
        }

        const container = document.getElementById("recaptcha-container");
        if (!container) throw new Error("recaptcha-container no encontrado");

        (window as any).recaptchaVerifier = new RecaptchaVerifier(
            auth,
            container,
            { size: "normal" }
        );

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