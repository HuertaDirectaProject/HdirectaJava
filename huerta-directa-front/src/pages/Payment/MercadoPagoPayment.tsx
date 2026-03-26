import { useNavigate } from "react-router-dom";
import { CheckoutHeader } from "../../components/Checkout/CheckoutHeader";
import { SecureFooter } from "../../components/Checkout/SecureFooter";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useEffect, useRef } from "react";
import { useCart } from "../../contexts/CartContext";
import paymentService from "../../services/paymentService";
import Swal from "sweetalert2";

export const MercadoPagoPayment = () => {
  usePageTitle("MercadoPayment");
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { totals, clearCart, items } = useCart();
  const CONFIG = {
    PUBLIC_KEY: import.meta.env.VITE_MP_PUBLIC_KEY,
    DESCRIPTION: "Compra Huerta Directa",
    PAYER_EMAIL: "test@test.com",
  };

  useEffect(() => {
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Debes tener productos en el carrito antes de proceder al pago",
        confirmButtonColor: "#8dc84b",
      }).finally(() => {
        navigate("/payment/checkout");
      });
      return;
    }

    const initBrick = () => {
      if (!(window as any).MercadoPago) return;

      const mp = new (window as any).MercadoPago(CONFIG.PUBLIC_KEY, {
        locale: "es-CO",
      });

      const bricksBuilder = mp.bricks();

      const settings = {
        initialization: {
          amount: Math.floor(totals.total),
          payer: { email: CONFIG.PAYER_EMAIL },
        },
        customization: {
          visual: { style: { theme: "default" } },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            maxInstallments: 12,
          },
        },
        callbacks: {
          onReady: () => console.log("✅ Brick cargado"),
          onSubmit: async (data: any) => {
            console.log("🔥 onSubmit disparado:", JSON.stringify(data));
            try {
              const payload = {
                transaction_amount: Math.floor(totals.total),
                description: CONFIG.DESCRIPTION,
                payment_method_id: data.formData.payment_method_id,
                token: data.formData.token,
                installments: data.formData.installments,
                issuer_id: data.formData.issuer_id,
                carrito: items.map(item => ({
                  productId: item.id,
                  nombre: item.nombre,
                  cantidad: item.cantidad,
                  precio: item.precio,
                  descripcion: item.descripcion ?? "",
                  imagen: item.imagen ?? ""
                })),
                payer: {
                  email: data.formData.payer?.email ?? CONFIG.PAYER_EMAIL,
                  first_name: data.formData.payer?.firstName ?? "",
                  last_name: data.formData.payer?.lastName ?? "",
                  identification: {
                    type: data.formData.payer?.identification?.docType ?? "CC",
                    number:
                      data.formData.payer?.identification?.docNumber ?? "",
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
    };

    const existingScript = document.querySelector(
      'script[src="https://sdk.mercadopago.com/js/v2"]',
    );

    if (existingScript) {
      initBrick();
    } else {
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = initBrick;
      document.head.appendChild(script);
    }
  }, [items.length, navigate, totals.total]);

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
