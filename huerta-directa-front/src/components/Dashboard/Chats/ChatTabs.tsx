import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faLock } from "@fortawesome/free-solid-svg-icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatTabsProps {
  activeTab: "social" | "privado";
  onTabChange: (tab: "social" | "privado") => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const ChatTabs: React.FC<ChatTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 w-fit">
      <button
        onClick={() => onTabChange("privado")}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
          activeTab === "privado"
            ? "bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        <FontAwesomeIcon icon={faLock} className="text-xs" />
        Mensajes Privados
        <span className="ml-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
          Pronto
        </span>
      </button>
      <button
        onClick={() => onTabChange("social")}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
          activeTab === "social"
            ? "bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        <FontAwesomeIcon icon={faUsers} className="text-xs" />
        Área Social
      </button>
    </div>
  );
};

export default ChatTabs;
