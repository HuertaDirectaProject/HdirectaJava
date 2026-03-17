import { useState } from "react";
import {
  faUser,
  faInfoCircle,
  faHeart,
  faStar,
  faCartShopping,
  faBan,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../GlobalComponents/Button";
import { useCart } from "../../hooks/useCart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { favoriteService } from "../../services/favoriteService";
import Swal from "sweetalert2";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  reviewCount?: number;
  averageRating?: number;
  images?: string[];
  isFavorite?: boolean;
  discountOffer?: number;
}

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const hasStock = product.stock && product.stock > 0;
  const isOwner = false;

  const hasDiscount = product.discountOffer && product.discountOffer > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountOffer! / 100)
    : product.price;

  const allImages = [product.image, ...(product.images || [])];

  const handleFavoriteToggle = async () => {
    if (isFavoriteLoading) return;
    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(product.id);
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
        await favoriteService.addFavorite(product.id);
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

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      nombre: product.name,
      descripcion: "",
      precio: discountedPrice,
      cantidad: 1,
      subtotal: discountedPrice,
      imagen: product.image,
    });
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <div className="max-w-75 w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-stone-200/60 dark:border-zinc-700 group transition-transform duration-500 hover:scale-[1.007]">
      
      {/* Imagen Slider */}
      <div className="relative h-64 overflow-hidden group/slider">
        <img
          src={allImages[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-[#8bc34a] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[#8bc34a] hover:text-white shadow-md z-10 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-[#8bc34a] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-[#8bc34a] hover:text-white shadow-md z-10 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? "w-4 bg-[#8bc34a]"
                      : "w-1 bg-white/60 dark:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Favorito */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            text=""
            iconLetf={faHeart}
            onClick={handleFavoriteToggle}
            className={`backdrop-blur-md px-1 gap-0! py-1.5! rounded-full shadow-none hover:bg-white! hover:text-[#8bc34a]! ${isFavorite ? "bg-white text-red-500!" : "bg-white/80 dark:bg-zinc-800/80 text-[#8bc34a]!"} ${isFavoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFavoriteLoading}
          />
        </div>

        {/* Badge de Descuento */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
              -{product.discountOffer}% OFF
            </div>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute bottom-4 left-4 z-10">
          {hasStock ? (
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-3 py-1! rounded-full flex items-center gap-2 shadow text-[#8bc34a] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#8bc34a] animate-pulse"></span>
              {product.stock} disponibles
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-3 py-1! rounded-full shadow text-red-500 text-xs font-semibold">
              Sin stock
            </div>
          )}
        </div>

        {/* Categoria */}
        {product.category && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-3 py-1! rounded-full shadow text-[#8bc34a] text-[10px] font-semibold uppercase tracking-wide">
              {product.category}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="px-6 py-2 space-y-1">
        <div>
          <h2 className="text-2xl font-bold text-black/80 dark:text-white">
            {product.name}
          </h2>
        </div>

        <hr className="border-stone-100 dark:border-zinc-700" />

        {/* Precio + Rating */}
        <div className="flex items-end justify-between">
          
          {/* Precio */}
          <div className="space-y-1">
            <div className="flex flex-col gap-0.5">
              {hasDiscount && (
                <span className="text-sm font-bold text-stone-300 dark:text-zinc-500 line-through leading-none">
                  ${product.price.toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#8bc34a] dark:text-[#a2d16c]">
                  ${discountedPrice.toLocaleString()}
                </span>
                <span className="text-[15px] font-medium text-stone-400 dark:text-zinc-400">
                  / COP
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled =
                  product.reviewCount &&
                  product.averageRating &&
                  star <= Math.round(product.averageRating);

                return (
                  <Button
                    key={star}
                    text=""
                    iconLetf={faStar}
                    className={`bg-transparent! shadow-none! p-0! gap-0! ${
                      filled
                        ? "text-yellow-400!"
                        : "text-gray-300! dark:text-zinc-600!"
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-[12px] text-stone-400/50 dark:text-zinc-500 font-medium italic">
              {product.reviewCount && product.reviewCount > 0
                ? `${product.reviewCount} reseñas`
                : "Sin reseñas aún"}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-5 gap-3 py-2">
          
          {/* Info */}
          <Button
            to={`/producto/${product.id}`}
            text=""
            iconLetf={faInfoCircle}
            className="col-span-1 flex items-center justify-center bg-stone-300 dark:bg-zinc-700 text-stone-600 dark:text-zinc-200 rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-600 py-2! px-2! gap-0!"
          />

          {/* Botón principal */}
          {isOwner ? (
            <Button
              text="Tu producto"
              iconLetf={faUser}
              disabled
              className="col-span-4 bg-gray-500 py-3! px-6! rounded-xl flex items-center justify-center gap-3"
            />
          ) : !hasStock ? (
            <Button
              text="Sin stock"
              iconLetf={faBan}
              disabled
              className="col-span-4 bg-gray-500 py-3 px-6 rounded-xl flex items-center justify-center gap-3"
            />
          ) : (
            <Button
              text="Agregar al Carrito"
              iconLetf={faCartShopping}
              onClick={handleAddToCart}
              className="col-span-4 bg-[#8bc34a] hover:bg-[#7cb342] text-white font-bold py-3! px-2! rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-[#8bc34a]/20 active:scale-95"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;