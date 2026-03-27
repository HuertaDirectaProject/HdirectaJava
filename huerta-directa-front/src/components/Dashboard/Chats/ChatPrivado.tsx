import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { useChatPrivado } from "../../../hooks/Chats/useChatPrivado";

import ChatPrivadoHeader from "./ChatPrivado/ChatPrivadoHeader";
import MessageBubble from "./ChatPrivado/MessageBubble";
import ChatPrivadoInput from "./ChatPrivado/ChatPrivadoInput";
import ConversationList from "./ChatPrivado/ConversationList";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatPrivadoProps {
  initialUserId?: number;
  initialUserName?: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────

const ChatPrivado: React.FC<ChatPrivadoProps> = ({
  initialUserId,
  initialUserName,
}) => {
  const BASE_URL = import.meta.env.VITE_API_URL ?? "";

  const {
    conversations,
    messages,
    activeUserId,
    inputValue,
    setInputValue,
    uploading,
    currentUser,
    chatAreaRef,
    fileInputRef,
    mediaPreview,
    openConversation,
    sendMessage,
    handleKeyDown,
    handleFileSelect,
    clearMediaPreview,
    formatTime,
    isMine,
    deleteConversation,
    setActiveUserId,
  } = useChatPrivado();

  // Abrir conversación inicial si se pasa un userId desde fuera
  React.useEffect(() => {
    if (initialUserId) openConversation(initialUserId, initialUserName);
  }, [initialUserId]);

  // Dentro del componente ChatPrivado, justo después de los hooks del useChatPrivado:
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Info del usuario activo
  const activeConv = conversations.find((c) => c.otherId === activeUserId);
  console.log("activeConv:", activeConv);
  console.log("otherRole:", activeConv?.otherRole);

  return (
    <div className="flex-1 flex rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
      {/* ── Panel izquierdo: lista de conversaciones ─────────────────────── */}
      <ConversationList
        conversations={conversations}
        activeUserId={activeUserId}
        currentUserId={currentUser?.id}
        formatTime={formatTime}
        onOpen={(id) => openConversation(id)}
        onDelete={deleteConversation} // ← del hook (lo implementamos antes)
        onBlock={(id) => console.log("bloquear", id)} // ← placeholder por ahora
        onReport={(id) => console.log("reportar", id)} // ← placeholder por ahora
      />
      {/* ── Panel derecho: chat activo ────────────────────────────────────── */}
      {activeUserId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {activeConv ? (
            <ChatPrivadoHeader
              activeName={activeConv.otherName ?? "Usuario"}
              activeImage={activeConv.otherProfileImageUrl}
              activeRole={activeConv.otherRole}
              onBack={() => setActiveUserId(null)}
            />
          ) : (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 h-14.25" />
          )}

          {/* Área de mensajes */}
          <div
            ref={chatAreaRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at top left, #111827 0%, #111827 40%, #111827 100%)"
                : "radial-gradient(ellipse at top left, #f1f8e9 0%, #f9fbe7 40%, #fff 100%)",
            }}
          >
            <style>{`
              .dark [data-chat-area] {
                background: #111827 !important;
              }
            `}</style>
            <div
              data-chat-area
              className="min-h-full"
              style={{
                background: document.documentElement.classList.contains("dark")
                  ? "radial-gradient(ellipse at top left, #1a2e1a 0%, #1f2d1f 40%, #111827 100%)"
                  : "radial-gradient(ellipse at top left, #f1f8e9 0%, #f9fbe7 40%, #fff 100%)",
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Envía el primer mensaje 👋
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id ?? i}
                    msg={msg}
                    isMine={isMine(msg)}
                    formatTime={formatTime}
                    BASE_URL={BASE_URL}
                  />
                ))
              )}
            </div>
          </div>

          {/* Input + preview */}
          <ChatPrivadoInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            uploading={uploading}
            mediaPreview={mediaPreview}
            fileInputRef={fileInputRef}
            sendMessage={sendMessage}
            handleKeyDown={handleKeyDown}
            handleFileSelect={handleFileSelect}
            clearMediaPreview={clearMediaPreview}
          />
        </div>
      ) : (
        /* Estado vacío — solo desktop */
        <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)" }}
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              className="text-green-500 text-2xl"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-700 dark:text-gray-200 mb-1">
              Selecciona una conversación
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Elige un chat de la lista para comenzar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPrivado;
