import { API_URL } from "../config/api";
import type { Product } from "../types/Product";

/* CREAR */
export const createProduct = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/products/create`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

/* OBTENER MIS PRODUCTOS */
export const getMyProducts = async () => {
  const response = await fetch(`${API_URL}/api/products/mis-Productos`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  return response.json();
};

/* ELIMINAR */
export const deleteProduct = async (id: number) => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return true;
};

/* ACTUALIZAR */
export const updateProduct = async (id: number, product: Product) => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};