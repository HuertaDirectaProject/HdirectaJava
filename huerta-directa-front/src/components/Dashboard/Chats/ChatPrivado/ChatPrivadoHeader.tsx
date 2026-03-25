import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Avatar } from "./Avatar";

interface ChatPrivadoHeaderProps {
  activeName: string;
  activeImage?: string;
  onBack: () => void;
}

export const ChatPrivadoHeader: React.FC<ChatPrivadoHeaderProps> = ({
  activeName,
  activeImage,
  onBack,
}) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Botón volver en móvil */}
      <button
        className="md:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        onClick={onBack}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <Avatar name={activeName} imageUrl={activeImage} size="w-9 h-9" />

      <div>
        <p className="text-sm font-black text-gray-800 dark:text-gray-100">
          {activeName}
        </p>
      </div>
    </div>
  );
};

export default ChatPrivadoHeader;