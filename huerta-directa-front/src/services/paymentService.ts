const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface PaymentResult {
    status: string;
    id?: string;
    mensaje?: string;
    error?: boolean;
}

const paymentService = {
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