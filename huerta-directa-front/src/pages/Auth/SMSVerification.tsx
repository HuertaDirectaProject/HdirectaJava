import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSMSVerification } from "../../hooks/useSMSVerification";
import { Button } from "../../components/GlobalComponents/Button";

export const SMSVerification = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const phone = sessionStorage.getItem("pendingPhone") ?? "";


    const { sendSMS, verifyCode, loading, error, success } = useSMSVerification(phone);

    useEffect(() => {
        if (phone) {
            setTimeout(() => sendSMS(), 500);
        }
    }, []);

    useEffect(() => {
        if (success) {
            setTimeout(() => navigate("/HomePage"), 1500);
        }
    }, [success]);

    const handleInput = (value: string, index: number) => {
        const newCode = [...code];
        newCode[index] = value.replace(/\D/g, "");
        setCode(newCode);

        if (value && index < 5) {
            document.getElementById(`digit-${index + 1}`)?.focus();
        }

        if (newCode.every(d => d !== "") && index === 5) {
            verifyCode(newCode.join(""));
        }
    };

    return (
        <div className="min-h-screen bg-[#FEF5DC] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2">Verificación SMS</h1>
                <p className="text-center text-gray-500 mb-8">
                    Código enviado a <span className="text-[#8dc84b] font-bold">{phone}</span>
                </p>

                <div id="recaptcha-container" className="flex justify-center mb-6" />

                <div className="flex gap-3 justify-center mb-8">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            id={`digit-${i}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInput(e.target.value, i)}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#8dc84b] outline-none"
                        />
                    ))}
                </div>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">✅ Verificación exitosa</p>}

                <Button
                    onClick={() => verifyCode(code.join(""))}
                    disabled={code.some(d => d === "")}
                    isLoading={loading}
                    loadingText="Verificando..."
                    text="Continuar"
                    className="w-full py-3 text-white font-bold rounded-xl"
                />
            </div>
        </div>
    );
};