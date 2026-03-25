import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faImage,
  faVideo,
  faXmark,
  faSpinner,
  faCommentDots,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  useChatPrivado,
  type Conversation,
  type PrivateMessage,
} from "../../../hooks/Chats/useChatPrivado";

// ─── Tipos de props ────────────────────────────────────────────────────────────

interface ChatPrivadoProps {
  /** Permite abrir una conversación desde fuera (ej: botón en perfil de otro usuario) */
  initialUserId?: number;
  initialUserName?: string;
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string; imageUrl?: string; size?: string }> = ({
  name,
  imageUrl,
  size = "w-10 h-10",
}) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${size} rounded-full object-cover shrink-0`}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center shrink-0 text-white text-sm font-black`}
      style={{ background: "linear-gradient(135deg, #4caf50, #2e7d32)" }}
    >
      {initials}
    </div>
  );
};

// ─── Burbuja de mensaje ────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  msg: PrivateMessage;
  isMine: boolean;
  formatTime: (t: string) => string;
  BASE_URL: string;
}> = ({ msg, isMine, formatTime, BASE_URL }) => {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMine
            ? "rounded-tr-sm text-white"
            : "rounded-tl-sm bg-white text-gray-800 border border-gray-100"
        }`}
        style={
          isMine
            ? { background: "linear-gradient(135deg, #4caf50, #2e7d32)" }
            : undefined
        }
      >
        {/* Imagen */}
        {msg.mediaType === "IMAGE" && msg.mediaUrl && (
          <img
            src={`${BASE_URL}${msg.mediaUrl}`}
            alt="imagen"
            className="rounded-xl max-w-full mb-1.5 max-h-60 object-cover cursor-pointer"
            onClick={() => window.open(`${BASE_URL}${msg.mediaUrl}`, "_blank")}
          />
        )}

        {/* Video */}
        {msg.mediaType === "VIDEO" && msg.mediaUrl && (
          <video
            src={`${BASE_URL}${msg.mediaUrl}`}
            controls
            className="rounded-xl max-w-full mb-1.5 max-h-60"
          />
        )}

        {/* Texto */}
        {msg.content && (
          <p className="text-sm leading-relaxed wrap-break-word">
            {msg.content}
          </p>
        )}

        {/* Hora */}
        <p
          className={`text-[10px] mt-1 text-right ${
            isMine ? "text-green-100" : "text-gray-400"
          }`}
        >
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
};

// ─── Item de conversación ─────────────────────────────────────────────────────

const ConversationItem: React.FC<{
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
  formatTime: (t: string) => string;
  currentUserId?: number;
}> = ({ conv, isActive, onClick, formatTime, currentUserId }) => {
  const lastMsg = conv.lastMessage;
  const isLastMine = lastMsg.senderId === currentUserId;

  let preview = "";
  if (lastMsg.mediaType === "IMAGE") preview = "📷 Imagen";
  else if (lastMsg.mediaType === "VIDEO") preview = "🎥 Video";
  else preview = lastMsg.content || "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
        isActive
          ? "bg-green-50 border border-green-200"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      <div className="relative">
        <Avatar
          name={conv.otherName}
          imageUrl={conv.otherProfileImageUrl}
          size="w-11 h-11"
        />
        {conv.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {conv.unread > 9 ? "9+" : conv.unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-gray-800 truncate">
            {conv.otherName}
          </span>
          <span className="text-[10px] text-gray-400 ml-2 shrink-0">
            {formatTime(lastMsg.timestamp)}
          </span>
        </div>
        <p
          className={`text-xs truncate mt-0.5 ${
            conv.unread > 0
              ? "text-gray-800 font-semibold"
              : "text-gray-400 font-medium"
          }`}
        >
          {isLastMine ? "Tú: " : ""}
          {preview}
        </p>
      </div>
    </button>
  );
};

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
  } = useChatPrivado();

  // Abrir conversación inicial si se pasa un userId desde fuera
  React.useEffect(() => {
    if (initialUserId) openConversation(initialUserId);
  }, [initialUserId, openConversation]);

  // Info del usuario activo
  const activeConv = conversations.find((c) => c.otherId === activeUserId);
  const activeName =
    activeConv?.otherName ?? initialUserName ?? `Usuario ${activeUserId}`;
  const activeImage = activeConv?.otherProfileImageUrl;

  return (
    <div className="flex-1 flex rounded-3xl overflow-hidden border border-gray-200 bg-white min-h-0">
      {/* ── Panel izquierdo: lista de conversaciones ─────────────────────── */}
      <div
        className={`flex flex-col border-r border-gray-100 bg-gray-50/50 ${
          activeUserId ? "hidden md:flex w-72" : "flex w-full md:w-72"
        }`}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-sm font-black text-gray-700">Conversaciones</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
              <FontAwesomeIcon
                icon={faCommentDots}
                className="text-gray-300 text-3xl"
              />
              <p className="text-xs text-gray-400 font-medium text-center px-4">
                Aún no tienes conversaciones privadas
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.otherId}
                conv={conv}
                isActive={activeUserId === conv.otherId}
                onClick={() => openConversation(conv.otherId)}
                formatTime={formatTime}
                currentUserId={currentUser?.id}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Panel derecho: chat activo ────────────────────────────────────── */}
      {activeUserId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header del chat */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
            {/* Botón volver en móvil */}
            <button
              className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => openConversation(null as unknown as number)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <Avatar name={activeName} imageUrl={activeImage} size="w-9 h-9" />
            <div>
              <p className="text-sm font-black text-gray-800">{activeName}</p>
            </div>
          </div>

          {/* Área de mensajes */}
          <div
            ref={chatAreaRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            style={{ background: "#f9fafb" }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-xs text-gray-400 font-medium">
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

          {/* Preview del archivo seleccionado */}
          {mediaPreview && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <div className="relative inline-block">
                {mediaPreview.type === "IMAGE" ? (
                  <img
                    src={mediaPreview.url}
                    alt="preview"
                    className="h-20 w-auto rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <video
                    src={mediaPreview.url}
                    className="h-20 w-auto rounded-xl border border-gray-200"
                  />
                )}
                <button
                  onClick={clearMediaPreview}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              {/* Botón adjuntar archivo */}
              <div className="flex gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  id="private-image-input"
                />
                <label
                  htmlFor="private-image-input"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors cursor-pointer shrink-0"
                  title="Enviar imagen"
                >
                  <FontAwesomeIcon icon={faImage} className="text-sm" />
                </label>

                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  id="private-video-input"
                />
                <label
                  htmlFor="private-video-input"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors cursor-pointer shrink-0"
                  title="Enviar video"
                >
                  <FontAwesomeIcon icon={faVideo} className="text-sm" />
                </label>
              </div>

              {/* Textarea */}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                style={{ maxHeight: "120px" }}
              />

              {/* Botón enviar */}
              <button
                onClick={sendMessage}
                disabled={uploading || (!inputValue.trim() && !mediaPreview)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                }}
              >
                {uploading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Estado vacío cuando no hay conversación seleccionada — solo desktop */
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
            <p className="text-sm font-black text-gray-700 mb-1">
              Selecciona una conversación
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Elige un chat de la lista para comenzar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPrivado;
