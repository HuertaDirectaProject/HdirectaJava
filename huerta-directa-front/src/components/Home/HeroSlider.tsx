import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import img1 from "../../assets/image/1.png";
import img2 from "../../assets/image/pr4.png";
import img3 from "../../assets/image/pr5.png";
import img4 from "../../assets/image/pr6.png";

const slides = [
  {
    image: img1,
    imageClass: "absolute w-160 h-160 object-cover ml-90",
    tag: "Frutas Premium",
    title1: "Del campo a tu casa",
    title2: "Las más frescas del mercado",
  },
  {
    image: img2,
    imageClass: "absolute w-155 h-100 object-cover ml-90",
    tag: "Fruta Fresca",
    title1: "Recién Cosechada",
    title2: "Productos de calidad",
  },
  {
    image: img3,
    imageClass: "absolute w-145 h-80 object-cover ml-90",
    tag: "Frutas seleccionadas",
    title1: "La mejor cosecha",
    title2: "Agro Colombiano",
  },
  {
    image: img4,
    imageClass: "absolute w-155 h-100 object-cover ml-90",
    tag: "100% con amor",
    title1: "De la mejor calidad",
    title2: "De la huerta, Directo a tu casa",
  },
];

export const HeroSlider = () => {
  return (
    <section
      className=" transition-colors! duration-500! 
      py-10
      bg-linear-to-b from-[#FEF5DC] via-white to-[#FEF5DC] dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C]
      "
    >
      <div className="max-w-330 mx-auto">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 8000 }}
          loop={true}
          className="h-150"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-150 flex items-center justify-center overflow-hidden">
                {/* Imagen */}
                <img
                  src={slide.image}
                  alt={slide.tag}
                  className={slide.imageClass}
                />

                {/* Contenido */}
                <div
                  className="
                  relative z-10 mr-100 max-w-120
                  bg-white/70 dark:bg-[#111814]/80
                  backdrop-blur-sm
                  p-8
                  rounded-2xl
                  shadow-2xl
                  transition
                  "
                >
                  <h4
                    className="
                    inline-block
                    bg-[#8dc84b]
                    text-white
                    px-4 py-1
                    rounded-full
                    text-sm
                    mb-4
                    "
                  >
                    {slide.tag}
                  </h4>

                  <h2
                    className="
                    text-3xl
                    font-normal
                    text-[#8dc84b]
                    dark:text-[#9be15d]
                    leading-snug
                    mb-5
                    "
                  >
                    <span className="dark:text-gray-200">{slide.title1}</span>
                    <br />
                    <strong className="text-4xl font-bold">
                      {slide.title2}
                    </strong>
                  </h2>

                  <a
                    href="#"
                    className="
                    inline-block
                    px-8 py-4
                    bg-[#8dc84b]
                    text-white
                    font-semibold
                    rounded-full
                    uppercase
                    transition
                    transform
                    hover:scale-105
                    hover:bg-[#004d00]
                    "
                  >
                    Ver Más
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
