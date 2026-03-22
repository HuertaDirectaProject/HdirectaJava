import React, { createContext, useContext, useState, useCallback } from "react";

// TIPOS
export interface CartItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  imagen?: string;
}

export interface CartTotals {
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  calculateTotals: () => CartTotals;
}

// CREAR CONTEXTO
const CartContext = createContext<CartContextType | undefined>(undefined);

// PROVIDER
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const IVA_PERCENT = 19;
  const DESCUENTO_PERCENT = 10;

  // Calcular totales
  const calculateTotals = useCallback((): CartTotals => {
    const subtotal = Math.floor(items.reduce((sum, item) => sum + item.subtotal, 0));
    const descuento = Math.floor(subtotal * (DESCUENTO_PERCENT / 100));
    const iva = Math.floor((subtotal - descuento) * (IVA_PERCENT / 100));
    const total = subtotal - descuento + iva;

    return { subtotal, descuento, iva, total };
}, [items]);
  // Agregar producto
  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                cantidad: p.cantidad + item.cantidad,
                subtotal: p.precio * (p.cantidad + item.cantidad),
              }
            : p,
        );
      }
      return [
        ...prev,
        {
          ...item,
          subtotal: item.precio * item.cantidad,
        },
      ];
    });
  }, []);

  // Eliminar producto
  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback(
    (id: number, cantidad: number) => {
      if (cantidad <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, cantidad, subtotal: p.precio * cantidad } : p,
        ),
      );
    },
    [removeItem],
  );

  // Vaciar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = calculateTotals();

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        calculateTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// HOOK PARA USAR CONTEXTO
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};
