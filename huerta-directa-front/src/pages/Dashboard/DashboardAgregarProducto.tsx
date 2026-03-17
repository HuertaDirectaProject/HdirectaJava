import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProductForm } from "../../hooks/Productos/useProductForm";
import {
  faBoxOpen,
 
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useImageUpload } from "../../hooks/Productos/useImageUpload";
import { ProductPreview } from "../../components/Dashboard/Productos/ProductPreview";
import { ProductForm } from "../../components/Dashboard/Productos/ProductForm";

export const DashboardAgregarProducto: React.FC = () => {
  usePageTitle("Agregar Producto");
  const { formData, setFormData, loading, submitProduct } = useProductForm();

  const {
    images,
    currentImageIndex,
    handleImageChange,
    removeImage,
    nextImage,
    prevImage,
    resetImages,
  } = useImageUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();

    form.append("nombre", formData.name);
    form.append("precio", formData.price);
    form.append("unidad", "unidad");
    form.append("categoria-producto", formData.category);
    form.append("descripcion", formData.description);
    form.append("stock", formData.stock);

    if (images.length > 0) {
      form.append("image_product", images[0].file);
    }

    images.slice(1).forEach((img) => {
      form.append("additional_images", img.file);
    });

    try {
      await submitProduct(form);

      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
      });

      resetImages();
    } catch (error) {
      console.error(error);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-fadeIn  transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#ffa000] dark:bg-[#835628] text-white flex items-center justify-center shadow-lg shadow-[#ffa000]/20">
          <FontAwesomeIcon icon={faBoxOpen} size="lg" />
        </div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
          Agregar Nuevo Producto
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="xl:col-span-2 bg-white dark:bg-[#1A221C] p-8 md:p-10 rounded-4xl shadow-sm border border-gray-100 dark:border-slate-700">
          <ProductForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            images={images}
            loading={loading}
          />
        </div>

        {/* PREVIEW */}

        <div className="xl:col-span-1">
          <div className="sticky top-8 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2 border-l-4 border-[#8dc84b]">
              Vista Previa
            </h3>

            <ProductPreview
              images={images}
              currentImageIndex={currentImageIndex}
              prevImage={prevImage}
              nextImage={nextImage}
              formData={formData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAgregarProducto;
