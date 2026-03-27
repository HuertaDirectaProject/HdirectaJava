import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Avatar } from "./Avatar";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const getImageSrc = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${BASE_URL}${imageUrl}`;
};

interface ChatPrivadoHeaderProps {
  activeName: string;
  activeImage?: string;
  activeRole?: number; // ← AGREGAR
  onBack: () => void;
}

export const ChatPrivadoHeader: React.FC<ChatPrivadoHeaderProps> = ({
  activeName,
  activeImage,
  activeRole, // ← AGREGAR
  onBack,
}) => {
  const isAdmin = activeRole === 1; // ← AGREGAR

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <button
          className="md:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          onClick={onBack}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <Avatar
          name={activeName}
          imageUrl={getImageSrc(activeImage)}
          size="w-9 h-9"
        />

        <div>
          <p className="text-sm font-black text-gray-800 dark:text-gray-100">
            {activeName}
          </p>
        </div>
      </div>

      {/* Badge rol */}
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
        isAdmin
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      }`}>
        {isAdmin ? "Administrador" : "Usuario"}
      </span>
    </div>
  );
};

export default ChatPrivadoHeader;