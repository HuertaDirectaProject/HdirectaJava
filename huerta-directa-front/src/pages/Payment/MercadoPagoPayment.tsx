import { useNavigate } from "react-router-dom";
import { CheckoutHeader } from "../../components/Checkout/CheckoutHeader";
import { SecureFooter } from "../../components/Checkout/SecureFooter";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useEffect, useRef } from "react";
import { useCart } from "../../contexts/CartContext";
import { getShippingPrice } from "../../contexts/PaymentContext";
import { usePayment } from "../../hooks/usePayment";
import paymentService from "../../services/paymentService";
import Swal from "sweetalert2";

export const MercadoPagoPayment = () => {
    usePageTitle("MercadoPayment");
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const isCompletingPaymentRef = useRef(false);
    const { totals, clearCart, items } = useCart();
    const { shippingMethod } = usePayment();
    const shippingPrice = getShippingPrice(shippingMethod);
    const totalWithShipping = totals.total + shippingPrice;

    const CONFIG = {
        PUBLIC_KEY: import.meta.env.VITE_MP_PUBLIC_KEY,
        DESCRIPTION: "Compra Huerta Directa",
        PAYER_EMAIL: "test@test.com",
    };

    useEffect(() => {
        if (isCompletingPaymentRef.current) {
            return;
        }

        // Solo redirigir silenciosamente si entran directo sin carrito.
        if (items.length === 0) {
            navigate("/payment/checkout", { replace: true });
            return;
        }

        const initBrick = async () => {        // ← async del doc 3 (necesario para await)
            if (!(window as any).MercadoPago) return;

            // Del doc 3: cleanup del brick anterior
            if ((window as any).paymentBrickController) {
                try {
                    (window as any).paymentBrickController.unmount();
                } catch (e) {}
                (window as any).paymentBrickController = null;
            }

            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }

            const mp = new (window as any).MercadoPago(CONFIG.PUBLIC_KEY, {
                locale: "es-CO",
            });

            const bricksBuilder = mp.bricks();

            const settings = {
                initialization: {
                    amount: Math.floor(totalWithShipping),
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
                        try {
                            let stockValidation;
                            try {
                                stockValidation = await paymentService.validateCartStock(
                                    items.map((item) => ({
                                        productId: item.id,
                                        cantidad: item.cantidad,
                                    })),
                                );
                            } catch {
                                await Swal.fire({
                                    icon: "error",
                                    title: "No se pudo validar stock",
                                    text: "Intenta nuevamente en unos segundos",
                                    confirmButtonColor: "#8dc84b",
                                });
                                return;
                            }

                            if (!stockValidation.valid) {
                                const lines = stockValidation.errors
                                    .map((err) => {
                                        const name = err.nombre ?? `Producto ${err.productId ?? ""}`.trim();
                                        if (typeof err.disponible === "number" && typeof err.solicitado === "number") {
                                            return `${name}: disponible ${err.disponible}, solicitado ${err.solicitado}`;
                                        }
                                        return `${name}: ${err.error}`;
                                    })
                                    .join("\n");

                                await Swal.fire({
                                    icon: "warning",
                                    title: "Stock insuficiente",
                                    text: lines || "Algunos productos ya no tienen stock suficiente",
                                    confirmButtonColor: "#8dc84b",
                                });
                                navigate("/payment/checkout", { replace: true });
                                return;
                            }

                            const payload = {
                                transaction_amount: Math.floor(totalWithShipping),
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
                                        number: data.formData.payer?.identification?.docNumber ?? "",
                                    },
                                },
                            };

                            const result = await paymentService.processPayment(payload);

                            if (result.status === "approved") {
                                isCompletingPaymentRef.current = true;
                                clearCart();
                                navigate("/payment/success");
                            } else if (result.status === "pending" || result.status === "in_process") {
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
                // Del doc 3: guarda el controller para poder hacer unmount
                const controller = await bricksBuilder.create(
                    "payment",
                    "paymentBrick_container",
                    settings
                );
                (window as any).paymentBrickController = controller;
            }
        };

        const existingScript = document.querySelector(
            'script[src="https://sdk.mercadopago.com/js/v2"]',
        );

        if (existingScript) {
            setTimeout(initBrick, 300);   // doc 4 usa 300ms, más rápido que 1000ms
        } else {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.async = true;
            script.onload = initBrick;
            document.head.appendChild(script);
        }

        // Del doc 3: cleanup al desmontar — DENTRO del useEffect
        return () => {
            if ((window as any).paymentBrickController) {
                try {
                    (window as any).paymentBrickController.unmount();
                } catch (e) {}
                (window as any).paymentBrickController = null;
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [items.length, navigate, totalWithShipping]); // dependencias del doc 4

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