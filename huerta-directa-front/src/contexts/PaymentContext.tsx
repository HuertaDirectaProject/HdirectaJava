import React, { createContext, useContext, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type ShippingMethod = 'standard' | 'express' | 'pickup';

export const SHIPPING_METHOD_CONFIG: Record<ShippingMethod, { label: string; price: number }> = {
  standard: { label: 'Envío Estándar', price: 15000 },
  express: { label: 'Envío Express', price: 15000 },
  pickup: { label: 'Tarifa acordada', price: 0 },
};

export const getShippingPrice = (method: ShippingMethod): number =>
  SHIPPING_METHOD_CONFIG[method]?.price ?? 0;

export const getShippingLabel = (method: ShippingMethod): string =>
  SHIPPING_METHOD_CONFIG[method]?.label ?? 'Envío';

export interface ShippingAddress {
  nombre: string;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
}

interface PaymentContextType {
  status: 'idle' | 'loading' | 'success' | 'error';
  paymentMethod: string;
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress | null;
  error: string | null;
  paymentId: string | null;

  setPaymentMethod: (method: string) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  processPayment: (data: any) => Promise<any>;
  setError: (error: string) => void;
  clearError: () => void;
  reset: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const processPayment = useCallback(async (data: any) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al procesar pago');
      }

      const result = await response.json();
      setPaymentId(result.id?.toString() || null);
      setStatus(result.status === 'approved' ? 'success' : 'error');

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setPaymentMethod('credit_card');
    setShippingMethod('standard');
    setShippingAddress(null);
    setError(null);
    setPaymentId(null);
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        status,
        paymentMethod,
        shippingMethod,
        shippingAddress,
        error,
        paymentId,
        setPaymentMethod,
        setShippingMethod,
        setShippingAddress,
        processPayment,
        setError,
        clearError,
        reset,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment debe usarse dentro de PaymentProvider');
  }
  return context;
};

