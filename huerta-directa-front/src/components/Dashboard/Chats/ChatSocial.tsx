import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faUsers,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import type { ChatMessage } from "../../../hooks/useChatSocial";
import type { User } from "../../../services/authService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatSocialProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  connected: boolean;
  currentUser: User | null;
  chatAreaRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  formatTime: (timestamp: string) => string;
  isMine: (msg: ChatMessage) => boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const ChatSocial: React.FC<ChatSocialProps> = ({
  messages,
  inputValue,
  setInputValue,
  connected,
  currentUser,
  chatAreaRef,
  sendMessage,
  handleKeyDown,
  formatTime,
  isMine,
}) => {
  const isDark = document.documentElement.classList.contains("dark");
  return (
    <div className="flex-1 flex flex-col rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 min-h-0">
      {/* ── Header del chat ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)" }}
          >
            <FontAwesomeIcon
              icon={faUsers}
              className="text-green-600 text-sm"
            />
          </div>
          <div>
            <p className="font-black text-gray-800 dark:text-gray-100 text-sm">
              Chat Área Social
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              Todos los productores y compradores
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{
                background: "linear-gradient(135deg, #4caf50, #8bc34a)",
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {currentUser.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Área de mensajes ──────────────────────────────────────────────── */}
      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-h-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at top left, #1a2e1a 0%, #1f2d1f 40%, #111827 100%)"
            : "radial-gradient(ellipse at top left, #f1f8e9 0%, #f9fbe7 40%, #fff 100%)",
        }}
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "#e8f5e9" }}
            >
              <FontAwesomeIcon
                icon={faLeaf}
                className="text-green-400 text-2xl"
              />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              Sé el primero en escribir algo 🌱
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const mine = isMine(msg);
          return (
            <div
              key={msg.id ?? idx}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              {!mine && (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-1">
                  {msg.senderName}
                </span>
              )}
              <div
                className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                  mine
                    ? "text-white rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-600"
                }`}
                style={
                  mine
                    ? {
                        background: "linear-gradient(135deg, #4caf50, #8bc34a)",
                      }
                    : {}
                }
              >
                <p className="text-sm leading-relaxed wrap-break-word">
                  {msg.content}
                </p>
              </div>
              <span className="text-[10px] text-gray-300 dark:text-gray-500 font-medium mt-1 mx-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Input para escribir ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 px-5 py-4 border-t border-gray-50 dark:border-gray-700">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje para el área social..."
            disabled={!connected}
            className="flex-1 pl-5 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200  border border-gray-100 dark:border-gray-600  bg-[#f7faf7] dark:bg-gray-700  text-gray-800 dark:text-gray-100  placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-300 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900
    disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !inputValue.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            style={{ background: "linear-gradient(135deg, #4caf50, #8bc34a)" }}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSocial;
