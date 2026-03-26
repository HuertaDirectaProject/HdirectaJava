import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faTrash,
  faBan,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import type { Conversation } from "../../../../hooks/Chats/useChatPrivado";
import Avatar from "./Avatar";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const getImageSrc = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${BASE_URL}${imageUrl}`;
};

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
  formatTime: (t: string) => string;
  currentUserId?: number;
  onDelete: (id: number) => void;
  onBlock?: (id: number) => void;
  onReport?: (id: number) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  onClick,
  formatTime,
  currentUserId,
  onDelete,
  onBlock,
  onReport,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lastMsg = conv.lastMessage;
  const isLastMine = lastMsg.senderId === currentUserId;

  let preview = "";
  if (lastMsg.mediaType === "IMAGE") preview = "📷 Imagen";
  else if (lastMsg.mediaType === "VIDEO") preview = "🎥 Video";
  else preview = lastMsg.content || "";

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!menuBtnRef.current) return;
    const rect = menuBtnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right - 192, // 192 = w-48
    });
    setMenuOpen((prev) => !prev);
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  return (
    <div className="relative group">
      {/* ── Fila principal ─────────────────────────────────────────────── */}
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 pr-10 rounded-2xl transition-all text-left ${
          isActive
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
        }`}
      >
        {/* Avatar + badge */}
        <div className="relative shrink-0">
          <Avatar
            name={conv.otherName}
            imageUrl={getImageSrc(conv.otherProfileImageUrl)}
            size="w-11 h-11"
          />
          {conv.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {conv.unread > 9 ? "9+" : conv.unread}
            </span>
          )}
        </div>

        {/* Nombre + preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-gray-800 dark:text-gray-100 truncate">
              {conv.otherName}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 shrink-0">
              {formatTime(lastMsg.timestamp)}
            </span>
          </div>
          <p
            className={`text-xs truncate mt-0.5 ${
              conv.unread > 0
                ? "text-gray-800 dark:text-gray-200 font-semibold"
                : "text-gray-400 dark:text-gray-500 font-medium"
            }`}
          >
            {isLastMine ? "Tú: " : ""}
            {preview}
          </p>
        </div>
      </button>

      {/* ── Botón tres puntitos ─────────────────────────────────────────── */}
      <button
        ref={menuBtnRef}
        onClick={openMenu}
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition-all
          text-gray-400 dark:text-gray-500
          hover:bg-gray-200 dark:hover:bg-gray-600
          hover:text-gray-600 dark:hover:text-gray-300
          ${menuOpen
            ? "opacity-100 bg-gray-200 dark:bg-gray-600"
            : "opacity-0 group-hover:opacity-100"
          }
        `}
        title="Opciones"
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
      </button>

      {/* ── Dropdown — fixed para escapar del overflow-hidden ──────────── */}
      {menuOpen && (
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
          className="z-9999 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1"
        >
          <button
            onClick={(e) => handleMenuAction(e, () => onReport?.(conv.otherId))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFlag} className="text-orange-400 w-4" />
            Reportar usuario
          </button>

          <button
            onClick={(e) => handleMenuAction(e, () => onBlock?.(conv.otherId))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faBan} className="text-yellow-500 w-4" />
            Bloquear usuario
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

          <button
            onClick={(e) => handleMenuAction(e, () => onDelete(conv.otherId))}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4" />
            Eliminar conversación
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;