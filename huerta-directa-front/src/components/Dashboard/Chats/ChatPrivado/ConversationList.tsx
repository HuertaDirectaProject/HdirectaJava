import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import type { Conversation } from "../../../../hooks/Chats/useChatPrivado";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations: Conversation[];
  activeUserId: number | null;
  currentUserId?: number;
  formatTime: (t: string) => string;
  onOpen: (id: number) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeUserId,
  currentUserId,
  formatTime,
  onOpen,
}) => {
  return (
    <div
      className={`flex flex-col border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 ${
        activeUserId ? "hidden md:flex w-72" : "flex w-full md:w-72"
      }`}
    >
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-black text-gray-700 dark:text-gray-200">
          Conversaciones
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <FontAwesomeIcon
              icon={faCommentDots}
              className="text-gray-300 dark:text-gray-600 text-3xl"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium text-center px-4">
              Aún no tienes conversaciones privadas
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.otherId}
              conv={conv}
              isActive={activeUserId === conv.otherId}
              onClick={() => onOpen(conv.otherId)}
              formatTime={formatTime}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;