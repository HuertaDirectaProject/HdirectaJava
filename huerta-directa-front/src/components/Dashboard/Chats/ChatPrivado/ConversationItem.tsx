import React from "react";
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
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  onClick,
  formatTime,
  currentUserId,
}) => {
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
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
      }`}
    >
      <div className="relative">
        <Avatar
          name={conv.otherName}
          imageUrl={getImageSrc(conv.otherProfileImageUrl)} // ✅ después
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
  );
};

export default ConversationItem;
