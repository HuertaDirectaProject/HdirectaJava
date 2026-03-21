import { useNavigate } from "react-router-dom";
import { CheckoutHeader } from "../../components/Checkout/CheckoutHeader";
import { SecureFooter } from "../../components/Checkout/SecureFooter";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useEffect, useRef } from "react";
import { useCart } from "../../contexts/CartContext";
import paymentService from "../../services/paymentService";

export const MercadoPagoPayment = () => {
  usePageTitle("MercadoPayment");
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { totals, clearCart } = useCart();

  const CONFIG = {
    PUBLIC_KEY: import.meta.env.VITE_MP_PUBLIC_KEY,
    DESCRIPTION: "Compra Huerta Directa",
    PAYER_EMAIL: "test@test.com",
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mp = new (window as any).MercadoPago(CONFIG.PUBLIC_KEY, {
        locale: "es-CO",
      });

      const bricksBuilder = mp.bricks();

      const settings = {
        initialization: {
          amount: totals.total,
          payer: {
            email: CONFIG.PAYER_EMAIL,
          },
        },
        customization: {
          visual: {
            style: { theme: "default" },
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            maxInstallments: 12,
          },
        },
        callbacks: {
          onSubmit: async (data: any) => {
            console.log("🔥 onSubmit disparado:", JSON.stringify(data)); // ← AGREGA ESTO
            try {
              const payload = {
                ...data,
                transaction_amount: totals.total,
                description: CONFIG.DESCRIPTION,
                payer: {
                  email:
                    data.payer?.email ??
                    data.formData?.payer?.email ??
                    CONFIG.PAYER_EMAIL,
                  first_name:
                    data.payer?.firstName ??
                    data.formData?.payer?.firstName ??
                    "",
                  last_name:
                    data.payer?.lastName ??
                    data.formData?.payer?.lastName ??
                    "",
                  identification: {
                    type:
                      data.payer?.identification?.type ??
                      data.formData?.payer?.identification?.docType ??
                      "CC",
                    number:
                      data.payer?.identification?.number ??
                      data.formData?.payer?.identification?.docNumber ??
                      "",
                  },
                },
              };

              const result = await paymentService.processPayment(payload);

              if (result.status === "approved") {
                clearCart();
                navigate("/payment/success");
              } else if (
                result.status === "pending" ||
                result.status === "in_process"
              ) {
                navigate("/payment/pending");
              } else {
                navigate("/payment/failure");
              }
            } catch (error) {
              console.error("❌ Error en el pago:", error);
              navigate("/payment/failure");
            }
          },
          onError: (error: any) => console.error("❌ Error:", error),
        },
      };

      if (containerRef.current) {
        bricksBuilder.create("payment", "paymentBrick_container", settings);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [totals.total]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <CheckoutHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div
              ref={containerRef}
              id="paymentBrick_container"
              className="bg-white rounded-lg shadow-lg p-6"
            ></div>
          </div>
        </div>
        <SecureFooter />
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/HomePage")}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
          >
            ← Volver a comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoPayment;
