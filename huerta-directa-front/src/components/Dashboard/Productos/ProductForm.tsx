import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../GlobalComponents/Button";

interface ProductFormProps {
  formData: {
    name: string;
    price: string;
    category: string;
    description: string;
    stock: string;
  };

  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;

  handleSubmit: (e: React.FormEvent) => void;

  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  removeImage: (index: number) => void;

  images: { file: File; preview: string }[];

  loading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  handleImageChange,
  removeImage,
  images,
  loading,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* NOMBRE */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">
          Nombre del Producto
        </label>
        <input
          required
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="p-4 bg-gray-50 dark:bg-[#222b24] border-2 border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#8dc84b] dark:text-white"
          placeholder="Ej: Tomate Orgánico"
        />
      </div>

      {/* PRECIO */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">
          Precio (COP)
        </label>
        <input
          required
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="p-4 bg-gray-50 dark:bg-[#222b24] border-2 border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#8dc84b] dark:text-white"
          placeholder="0"
        />
      </div>

      {/* CATEGORIA */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">
          Categoría
        </label>
        <select
          required
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="p-4 bg-gray-50 dark:bg-[#222b24] border-2 border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#8dc84b] dark:text-white"
        >
          <option value="" disabled>Escoge una categoría</option>
          <option value="frutas">Frutas</option>
          <option value="verduras-hortalizas">Verduras y hortalizas</option>
          <option value="lacteos">Lácteos</option>
          <option value="carnes-y-proteinas">Carnes y proteínas</option>
          <option value="cereales-y-granos">Cereales y granos</option>
          <option value="productos-organicos">Productos orgánicos</option>
          <option value="miel-y-derivados">Miel y derivados</option>
          <option value="bebidas-naturales">Bebidas naturales</option>
          <option value="cajas-combos">Cajas mixtas o combos</option>
        </select>
      </div>

      {/* STOCK */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">
          Stock Inicial
        </label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="p-4 bg-gray-50 dark:bg-[#222b24] border-2 border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#8dc84b] dark:text-white"
          placeholder="0"
        />
      </div>

      {/* DESCRIPCION */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">
          Descripción
        </label>
        <textarea
          required
          rows={4}
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="p-4 bg-gray-50 dark:bg-[#222b24] border-2 border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:border-[#8dc84b] dark:text-white resize-none"
        />
      </div>

      {/* IMAGENES */}
      <div className="md:col-span-2">
        <label className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs block mb-4">
          Imágenes del Producto ({images.length}/5)
        </label>

        <label className="w-full h-48 border-4 border-dashed border-gray-100 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group relative transition-all duration-500 hover:border-[#8dc84b] hover:bg-green-50/30 dark:hover:bg-[#111712]">
          <input
            required
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          <FontAwesomeIcon
            icon={faUpload}
            className="text-4xl text-gray-300 group-hover:text-[#8dc84b]"
          />

          <p className="text-gray-400 dark:text-white font-bold">
            Cargar imágenes (Máx 5)
          </p>
        </label>

        {images.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {images.map((img, index) => (
              <li
                key={index}
                className="flex justify-between items-center dark:text-white bg-white dark:bg-[#222b24] p-3 rounded-xl"
              >
                <span className="text-sm truncate">{img.file.name}</span>

                <button
                  onClick={() => removeImage(index)}
                  className="text-red-400 text-xs font-bold cursor-pointer"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* BOTON */}
      <div className="md:col-span-2 pt-4">
        <Button
          type="submit"
          text={loading ? "Publicando producto..." : "Publicar Producto"}
          iconLetf={faCloudArrowUp}
          disabled={loading}
          className="w-full py-5 rounded-2xl shadow-xl shadow-[#8dc84b]/20 bg-[#8dc84b] text-white font-black text-lg"
        />
      </div>
    </form>
  );
};
