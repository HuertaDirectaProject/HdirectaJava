const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface PaymentResult {
    status: string;
    id?: string;
    mensaje?: string;
    error?: boolean;
}

export interface CartStockValidationError {
    productId?: number;
    nombre?: string;
    disponible?: number;
    solicitado?: number;
    error: string;
}

export interface CartStockValidationResult {
    valid: boolean;
    errors: CartStockValidationError[];
    mensaje?: string;
}

const paymentService = {
    async validateCartStock(carrito: Array<{ productId: number; cantidad: number }>): Promise<CartStockValidationResult> {
        const response = await fetch(`${API_BASE}/api/payments/validate-stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ carrito }),
        });

        const data = (await response.json()) as CartStockValidationResult;
        if (!response.ok) {
            return {
                valid: false,
                errors: Array.isArray(data.errors) ? data.errors : [],
                mensaje: data.mensaje ?? "Hay productos con stock insuficiente",
            };
        }

        return {
            valid: Boolean(data.valid),
            errors: Array.isArray(data.errors) ? data.errors : [],
            mensaje: data.mensaje,
        };
    },

    async processPayment(paymentData: any): Promise<PaymentResult> {
        const response = await fetch(`${API_BASE}/api/payments/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error("Error al procesar el pago");
        }

        return response.json();
    }
};

export default paymentService;