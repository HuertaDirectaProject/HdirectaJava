import React from "react";
import type { PrivateMessage } from "../../../../hooks/Chats/useChatPrivado";

interface MessageBubbleProps {
  msg: PrivateMessage;
  isMine: boolean;
  formatTime: (t: string) => string;
  BASE_URL: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  isMine,
  formatTime,
  BASE_URL,
}) => {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMine
            ? "rounded-tr-sm text-white"
            : "rounded-tl-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600"
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
            isMine ? "text-green-100" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;