import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { useCart } from "../useCart";
import authService from "../../services/authService";
import { API_URL } from "../../config/api";
import { favoriteService } from "../../services/favoriteService";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Product {
  idProduct: number;
  nameProduct: string;
  price: number;
  stock: number;
  imageProduct: string;
  descriptionProduct: string;
  category: string;
  unit: string;
  userName?: string;
  userId?: number;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
  discountOffer?: number;
}

export interface Comment {
  idComment: number;
  commentCommenter: string;
  creationComment: string;
  rating: number;
  nameCommenter: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const currentUser = authService.getCurrentUser();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // ── Cargar comentarios ────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments/product/${id}`, {
        credentials: "include",
      });
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    }
  }, [id]);

  // ── Cargar producto + relacionados ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          credentials: "include",
        });
        if (!res.ok) { setLoading(false); return; }

        const data: Product = await res.json();
        setProduct(data);
        setSelectedImage(data.imageProduct);
        fetchComments();

        if (data.category) {
          const relRes = await fetch(
            `${API_URL}/api/products/category/${encodeURIComponent(data.category)}`,
            { credentials: "include" }
          );
          if (relRes.ok) {
            const relData: Product[] = await relRes.json();
            setRelatedProducts(
              relData.filter((p) => p.idProduct !== Number(id)).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error("Error cargando producto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, fetchComments]);

  // ── Carrito ───────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const hasDiscount = !!(product.discountOffer && product.discountOffer > 0);
    const discountedPrice = hasDiscount
      ? product.price * (1 - product.discountOffer! / 100)
      : product.price;

    addItem({
      id: product.idProduct,
      nombre: product.nameProduct,
      descripcion: product.descriptionProduct,
      precio: discountedPrice,
      cantidad: quantity,
      subtotal: discountedPrice * quantity,
      imagen: `${API_URL}/uploads/productos/${product.imageProduct}`,
      producerId: product.userId,
      producerName: product.userName,
    });
  }, [product, quantity, addItem]);

  // ── Favoritos ─────────────────────────────────────────────────────────────
  const handleFavoriteToggle = useCallback(async () => {
    if (isFavoriteLoading || !product) return;
    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(product.idProduct);
        setIsFavorite(false);
        Swal.fire({ title: "Eliminado", text: "Producto eliminado de favoritos", icon: "info", timer: 1500, showConfirmButton: false, toast: true, position: "top-end" });
      } else {
        await favoriteService.addFavorite(product.idProduct);
        setIsFavorite(true);
        Swal.fire({ title: "¡Agregado!", text: "Producto agregado a favoritos", icon: "success", timer: 1500, showConfirmButton: false, toast: true, position: "top-end" });
      }
    } catch {
      Swal.fire({ title: "Error", text: "Ocurrió un error (¿Iniciaste sesión?)", icon: "error", toast: true, position: "top-end", timer: 3000, showConfirmButton: false });
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [isFavorite, isFavoriteLoading, product]);

  // ── Reseña ────────────────────────────────────────────────────────────────
  const handleSubmitReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const formData = new URLSearchParams();
      formData.append("commentCommenter", newComment);
      formData.append("productId", id ?? "");
      formData.append("rating", newRating.toString());

      const res = await fetch(`${API_URL}/api/comments/comment/add`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: formData.toString(),
      });

      if (res.ok) {
        Swal.fire({ title: "¡Gracias!", text: "Tu reseña ha sido publicada", icon: "success", timer: 2000, showConfirmButton: false, toast: true, position: "top-end" });
        setNewComment("");
        setNewRating(5);
        fetchComments();
        const prodRes = await fetch(`${API_URL}/api/products/${id}`, { credentials: "include" });
        if (prodRes.ok) setProduct(await prodRes.json());
        setActiveTab("reviews");
      } else {
        const errorData = await res.json().catch(() => ({}));
        Swal.fire({ title: "Error", text: errorData.error || "Debe iniciar sesión para dejar una reseña", icon: "error", timer: 3000, showConfirmButton: false, toast: true, position: "top-end" });
      }
    } catch (err) {
      console.error("Error enviando reseña:", err);
    } finally {
      setSubmittingReview(false);
    }
  }, [newComment, newRating, id, fetchComments]);

  // ── Valores derivados ─────────────────────────────────────────────────────
  const hasDiscount = !!(product?.discountOffer && product.discountOffer > 0);
  const discountedPrice = hasDiscount
    ? product!.price * (1 - product!.discountOffer! / 100)
    : product?.price ?? 0;
  const allImages = product
    ? [product.imageProduct, ...(product.images ?? [])]
    : [];
  const mainImageUrl = selectedImage
    ? `${API_URL}/uploads/productos/${selectedImage}`
    : `${API_URL}/uploads/productos/${product?.imageProduct}`;
  const rating = product?.averageRating ?? 0;
  const reviewCount = product?.reviewCount ?? 0;

  // ─── Retorno ──────────────────────────────────────────────────────────────
  return {
    // datos
    product,
    relatedProducts,
    comments,
    loading,
    submittingReview,
    currentUser,
    // imágenes
    allImages,
    mainImageUrl,
    selectedImage,
    setSelectedImage,
    // carrito
    quantity,
    setQuantity,
    handleAddToCart,
    // favoritos
    isFavorite,
    isFavoriteLoading,
    handleFavoriteToggle,
    // reseñas
    activeTab,
    setActiveTab,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    handleSubmitReview,
    // valores derivados
    hasDiscount,
    discountedPrice,
    rating,
    reviewCount,
    // navegación
    navigate,
  };
};