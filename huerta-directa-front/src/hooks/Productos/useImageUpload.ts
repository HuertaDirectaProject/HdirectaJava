import { useState } from "react";
import Swal from "sweetalert2";

export const useImageUpload = () => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = 5 - images.length;
      const filesToProcess = selectedFiles.slice(0, remainingSlots);

      if (filesToProcess.length === 0 && selectedFiles.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Máximo de imágenes alcanzado",
          text: "Solo puedes subir hasta 5 imágenes.",
          confirmButtonColor: "#16a34a",
        });
        return;
      }

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => {
              const newImages = [
                ...prev,
                { file, preview: e.target!.result as string },
              ];
              if (prev.length === 0) setCurrentImageIndex(0);
              return newImages;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, index) => index !== indexToRemove);

      if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(Math.max(0, newImages.length - 1));
      }

      return newImages;
    });
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const resetImages = () => {
    setImages([]);
    setCurrentImageIndex(0);
  };

  return {
    images,
    currentImageIndex,
    handleImageChange,
    removeImage,
    nextImage,
    prevImage,
    resetImages,
  };
};