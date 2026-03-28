import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import authService from "../services/authService";

// TIPOS
export interface CartItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  imagen?: string;
  producerId?: number;
  producerName?: string;
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
const CART_STORAGE_KEY_PREFIX = "huerta_cart_items";
const AUTH_CHANGED_EVENT = "huerta-auth-user-changed";

const getCurrentCartStorageKey = (): string => {
  const currentUser = authService.getCurrentUser();
  if (currentUser?.id) {
    return `${CART_STORAGE_KEY_PREFIX}_user_${currentUser.id}`;
  }
  return `${CART_STORAGE_KEY_PREFIX}_guest`;
};

const loadStoredCartItems = (storageKey: string): CartItem[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.id === "number")
      .map((item) => {
        const cantidad = Number(item.cantidad) > 0 ? Number(item.cantidad) : 1;
        const precio = Number(item.precio) || 0;

        return {
          id: Number(item.id),
          nombre: String(item.nombre ?? ""),
          descripcion: String(item.descripcion ?? ""),
          precio,
          cantidad,
          subtotal: precio * cantidad,
          imagen: item.imagen ? String(item.imagen) : undefined,
          producerId:
            typeof item.producerId === "number" ? Number(item.producerId) : undefined,
          producerName: item.producerName ? String(item.producerName) : undefined,
        } satisfies CartItem;
      });
  } catch {
    return [];
  }
};

// PROVIDER
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [storageKey, setStorageKey] = useState<string>(() =>
    getCurrentCartStorageKey(),
  );
  const [items, setItems] = useState<CartItem[]>(() =>
    loadStoredCartItems(getCurrentCartStorageKey()),
  );
  const IVA_PERCENT = 19;
  const DESCUENTO_PERCENT = 10;
  const MAX_STOCK_PER_PRODUCT = 100;

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
      const nextQuantity = (existing?.cantidad ?? 0) + item.cantidad;

      if (nextQuantity > MAX_STOCK_PER_PRODUCT) {
        Swal.fire({
          icon: "warning",
          title: "Stock inválido",
          text: "No se puede comprar más de 100 unidades",
        });
        return prev;
      }

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

      if (cantidad > MAX_STOCK_PER_PRODUCT) {
        Swal.fire({
          icon: "warning",
          title: "Stock inválido",
          text: "No se puede comprar más de 100 unidades",
        });
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

  useEffect(() => {
    const maybeSwitchCartBySession = () => {
      const nextKey = getCurrentCartStorageKey();
      setStorageKey((prevKey) => {
        if (nextKey !== prevKey) {
          setItems(loadStoredCartItems(nextKey));
          return nextKey;
        }
        return prevKey;
      });
    };

    maybeSwitchCartBySession();

    const handleFocus = () => {
      maybeSwitchCartBySession();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "user") {
        maybeSwitchCartBySession();
      }
    };

    const handleAuthChanged = () => {
      maybeSwitchCartBySession();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

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
