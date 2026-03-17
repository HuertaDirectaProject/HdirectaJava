import { useState } from "react";
import Swal from "sweetalert2";
import { createProduct } from "../../services/productService";

export const useProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);

  const submitProduct = async (form: FormData) => {
    setLoading(true);

    try {
      const result = await createProduct(form);

      Swal.fire({
        icon: "success",
        title: "Producto publicado",
        text: "Tu producto ya está disponible en la plataforma",
        timer: 2000,
        showConfirmButton: false,

        background: "#24302A",
        color: "#ffffff",

        customClass: {
          popup: "rounded-3xl shadow-2xl",
          title: "text-2xl font-black",
        },

        iconColor: "#8dc84b",
      });

      return result;
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Perfil incompleto",
        text: error.message,
        showCancelButton: true,
        confirmButtonText: "Ir a mi perfil",
        cancelButtonText: "Entendido",

        confirmButtonColor: "#8dc84b",
        cancelButtonColor: "#6b7280",

        customClass: {
          popup: "rounded-3xl",
          title: "text-xl font-bold",
          confirmButton: "px-6 py-3 rounded-xl font-bold",
          cancelButton: "px-6 py-3 rounded-xl font-bold",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/actualizacionUsuario";
        }
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    submitProduct,
  };
};
