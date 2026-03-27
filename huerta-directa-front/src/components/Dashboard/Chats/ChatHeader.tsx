import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf, faCircle } from "@fortawesome/free-solid-svg-icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatHeaderProps {
  connected: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const ChatHeader: React.FC<ChatHeaderProps> = ({ connected }) => {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: "linear-gradient(135deg, #4caf50, #8bc34a)" }}
        >
          <FontAwesomeIcon icon={faLeaf} className="text-white text-sm" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight dark:text-white">
          Mensajes
        </h1>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold">
        <FontAwesomeIcon
          icon={faCircle}
          className={connected ? "text-green-500" : "text-gray-300"}
          style={{ fontSize: "8px" }}
        />
        <span className={connected ? "text-green-600" : "text-gray-400"}>
          {connected ? "Conectado" : "Conectando..."}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;