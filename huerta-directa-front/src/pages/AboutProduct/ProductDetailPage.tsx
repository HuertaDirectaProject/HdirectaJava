import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCartShopping,
  faTruckFast,
  faShieldHalved,
  faArrowRotateLeft,
  faHeart,
  faShareNodes,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../components/GlobalComponents/Button";
import { useCart } from "../../hooks/useCart";
import { usePageTitle } from "../../hooks/usePageTitle";
import ProductCard from "../../components/Home/ProductCard";
import { favoriteService } from "../../services/favoriteService";
import Swal from "sweetalert2";

interface Product {
  idProduct: number;
  nameProduct: string;
  price: number;
  stock: number;
  imageProduct: string;
  descriptionProduct: string;
  category: string;
  unit: string;
  userName?: string;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
  discountOffer?: number;
}

interface Comment {
  idComment: number;
  commentCommenter: string;
  creationComment: string;
  rating: number;
  nameCommenter: string;
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
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

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8085/api/comments/product/${id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  usePageTitle(product ? product.nameProduct : "Cargando producto...");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8085/api/products/${id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedImage(data.imageProduct);

          // Fetch comments
          fetchComments();

          // Fetch related products - Using a more robust category search
          if (data.category) {
            const relatedResponse = await fetch(
              `http://localhost:8085/api/products/category/${encodeURIComponent(data.category)}`,
            );
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              const filtered = relatedData.filter(
                (p: Product) => p.idProduct !== Number(id),
              );
              setRelatedProducts(filtered.slice(0, 4));
            }
          }
        } else {
          console.error("Error fetching product details");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const hasDiscount = product.discountOffer && product.discountOffer > 0;
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
        imagen: `http://localhost:8085/uploads/productos/${product.imageProduct}`,
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (isFavoriteLoading || !product) return;
    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(product.idProduct);
        setIsFavorite(false);
        Swal.fire({
          title: "Eliminado",
          text: "Producto eliminado de favoritos",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      } else {
        await favoriteService.addFavorite(product.idProduct);
        setIsFavorite(true);
        Swal.fire({
          title: "¡Agregado!",
          text: "Producto agregado a favoritos",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error (¿Iniciaste sesión?)",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const formData = new URLSearchParams();
      formData.append("commentCommenter", newComment);
      formData.append("productId", id || "");
      formData.append("rating", newRating.toString());

      const response = await fetch(`http://localhost:8085/comment/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok || response.redirected) {
        setNewComment("");
        setNewRating(5);
        fetchComments();
        // also re-fetch product to get new average
        const prodRes = await fetch(`http://localhost:8085/api/products/${id}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProduct(prodData);
        }
        setActiveTab("reviews");
      } else {
        alert("Error al enviar la reseña. ¿Has iniciado sesión?");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b  from-[#FEF5DC] via-white to-[#FEF5DC]  py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#8dc84b] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium font-outfit">
          Cargando producto...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center bg-linear-to-b  from-[#FEF5DC] via-white to-[#FEF5DC] min-h-screen py-20 gap-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Producto no encontrado
        </h2>
        <Button text="Volver al inicio" onClick={() => navigate("/HomePage")} />
      </div>
    );
  }

  const allImages = [product.imageProduct, ...(product.images || [])];
  const mainImageUrl = selectedImage
    ? `http://localhost:8085/uploads/productos/${selectedImage}`
    : `http://localhost:8085/uploads/productos/${product.imageProduct}`;

  const rating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;
  const hasDiscount = product.discountOffer && product.discountOffer > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountOffer! / 100)
    : product.price;

  return (
    <div className="bg-linear-to-b  from-[#FEF5DC] via-white to-[#FEF5DC] min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-gray-500 items-center gap-2">
          <span
            className="cursor-pointer hover:text-[#8dc84b]"
            onClick={() => navigate("/HomePage")}
          >
            Inicio
          </span>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-xs text-gray-400"
          />
          <span className="cursor-pointer hover:text-[#8dc84b] capitalize">
            {product.category}
          </span>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-xs text-gray-400"
          />
          <span className="text-gray-800 font-medium truncate">
            {product.nameProduct}
          </span>
        </nav>

        {/* Product Main Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Images */}
            <div className="lg:col-span-8 p-6 lg:p-10 border-r border-gray-100">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="hidden md:flex flex-col gap-3">
                    {allImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${selectedImage === img ? "border-[#8dc84b]" : "border-gray-100 hover:border-gray-300"}`}
                      >
                        <img
                          src={`http://localhost:8085/uploads/productos/${img}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* main Image */}
                <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center relative min-h-100">
                    <img
                    src={mainImageUrl}
                    alt={product.nameProduct}
                    className="max-h-125 w-auto object-contain transition-transform duration-500 hover:scale-105"
                  />

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xl flex flex-col items-center">
                        <span className="text-xl">-{product.discountOffer}%</span>
                        <span className="text-[10px] uppercase tracking-tighter">Oferta</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={handleFavoriteToggle} 
                      disabled={isFavoriteLoading}
                      className={`w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-[#8dc84b]"} ${isFavoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-[#8dc84b] transition-colors">
                      <FontAwesomeIcon icon={faShareNodes} />
                    </button>
                  </div>

                  {/* Mobile Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 md:hidden flex justify-center gap-2">
                      {allImages.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedImage(img)}
                          className={`w-2 h-2 rounded-full transition-all ${selectedImage === img ? "bg-[#8dc84b] w-4" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Reviews Tabs (Desktop) */}
              <div className="mt-12 hidden lg:block">
                <div className="flex border-b border-gray-100 mb-6">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`pb-4 px-6 text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === "description" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Descripción
                    {activeTab === "description" && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#8dc84b] rounded-t-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-4 px-6 text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === "reviews" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Reseñas ({reviewCount})
                    {activeTab === "reviews" && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#8dc84b] rounded-t-full"></div>
                    )}
                  </button>
                </div>

                <div className="min-h-50">
                  {activeTab === "description" ? (
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                      <p className="whitespace-pre-line">
                        {product.descriptionProduct}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Subir reseña */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">
                          Deja tu opinión
                        </h3>
                        <form
                          onSubmit={handleSubmitReview}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className={`text-xl transition-colors ${star <= newRating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                <FontAwesomeIcon icon={faStar} />
                              </button>
                            ))}
                            <span className="text-sm font-medium text-gray-500 ml-2">
                              {newRating}/5
                            </span>
                          </div>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Cuéntanos qué te pareció el producto..."
                            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#8dc84b] focus:outline-none transition-all resize-none h-24 text-sm"
                          />
                          <button
                            disabled={submittingReview}
                            className="px-6 py-2 bg-[#8dc84b] text-white rounded-lg font-bold hover:bg-[#7ab33d] transition-all disabled:opacity-50"
                          >
                            {submittingReview
                              ? "Enviando..."
                              : "Publicar reseña"}
                          </button>
                        </form>
                      </div>

                      {/* Lista de reseñas */}
                      {comments.length > 0 ? (
                        <div className="space-y-6">
                          {comments.map((comment) => (
                            <div
                              key={comment.idComment}
                              className="border-b border-gray-50 pb-6"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold capitalize">
                                    {(comment.nameCommenter || "U")[0]}
                                  </div>
                                  <span className="font-bold text-gray-800 text-sm">
                                    {comment.nameCommenter || "Usuario Anónimo"}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    comment.creationComment,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex text-yellow-400 text-[10px] mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <FontAwesomeIcon
                                    key={i}
                                    icon={faStar}
                                    className={
                                      i < comment.rating ? "" : "text-gray-200"
                                    }
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed italic">
                                "{comment.commentCommenter}"
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-400 italic">
                          No hay reseñas para este producto aún. ¡Sé el primero
                          en opinar!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Info */}
            <div className="lg:col-span-4 p-6 lg:p-8 bg-gray-50/30">
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4">
                  {product.nameProduct}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-yellow-400 text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FontAwesomeIcon
                        key={s}
                        icon={faStar}
                        className={s <= rating ? "" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} reseñas)
                  </span>
                </div>

                <div className="mb-8 flex flex-col">
                  {hasDiscount && (
                    <span className="text-xl font-bold text-gray-400 line-through mb-1">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                  <div className="flex items-baseline">
                    <span className="text-4xl lg:text-5xl font-black text-[#8dc84b]">
                      ${discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-lg ml-2">
                      / {product.unit || "unidad"} COP
                    </span>
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <FontAwesomeIcon icon={faTruckFast} />
                    </div>
                    <div>
                      <p className="font-bold text-green-600 text-sm">
                        Llega gratis mañana
                      </p>
                      <p className="text-xs text-gray-500">
                        Solo en la ciudad de origen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FontAwesomeIcon icon={faArrowRotateLeft} />
                    </div>
                    <div>
                      <p className="font-bold text-blue-600 text-sm">
                        Devolución gratis
                      </p>
                      <p className="text-xs text-gray-500">
                        Tienes 30 días desde que lo recibes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 shadow-sm">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                    Vendido por
                  </p>
                  <p className="font-black text-gray-800 text-lg">
                    {product.userName || "Vendedor Local"}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">
                      Cantidad:
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-bold w-12 text-center text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(Math.min(product.stock, quantity + 1))
                          }
                          className="px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">
                        ({product.stock} disponibles)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <Button
                      text="Comprar ahora"
                      className="w-full py-4 rounded-xl bg-[#004d00] text-white font-black shadow-lg shadow-[#004d00]/20 border-none"
                    />
                    <Button
                      text="Agregar al carrito"
                      onClick={handleAddToCart}
                      className="w-full py-4 rounded-xl bg-[#004d00] text-white font-black shadow-lg shadow-[#004d00]/20 border-none"
                      iconLetf={faCartShopping}
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-center text-xs text-gray-400 py-4">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <p>
                      <span className="text-blue-500 font-bold">
                        Compra Protegida
                      </span>
                      . Recibe el producto que esperabas o te devolvemos tu
                      dinero.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile View: Description & Reviews */}
            <div className="lg:hidden p-6 border-t border-gray-100 space-y-10">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4">
                  Descripción
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.descriptionProduct}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-10">
                <h2 className="text-xl font-black text-gray-900 mb-6">
                  Reseñas ({reviewCount})
                </h2>
                {/* Submit review mobile */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Deja tu opinión
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`text-xl transition-colors ${star <= newRating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <FontAwesomeIcon icon={faStar} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tu opinión..."
                      className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#8dc84b] text-sm h-20"
                    />
                    <button className="w-full py-3 bg-[#8dc84b] text-white rounded-lg font-bold">
                      Publicar reseña
                    </button>
                  </form>
                </div>

                {/* Comments list mobile */}
                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div
                        key={comment.idComment}
                        className="pb-6 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-800 text-sm">
                            {comment.nameCommenter || "Usuario"}
                          </span>
                          <div className="flex text-yellow-400 text-[8px]">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={
                                  i < comment.rating ? "" : "text-gray-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          "{comment.commentCommenter}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 italic text-sm">
                    No hay reseñas aún.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-800 mb-8">
              Productos similares que podrían gustarte
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.idProduct}
                  product={{
                    id: p.idProduct,
                    name: p.nameProduct,
                    price: p.price,
                    stock: p.stock,
                    image: `http://localhost:8085/uploads/productos/${p.imageProduct}`,
                    category: p.category,
                    images: p.images,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
