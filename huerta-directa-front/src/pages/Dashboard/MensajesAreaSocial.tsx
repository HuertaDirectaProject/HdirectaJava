import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useChatSocial } from "../../hooks/Chats/useChatSocial";
import ChatTabs from "../../components/Dashboard/Chats/ChatTabs";
import ChatHeader from "../../components/Dashboard/Chats/ChatHeader";
import ChatSocial from "../../components/Dashboard/Chats/ChatSocial";
import ChatPrivado from "../../components/Dashboard/Chats/ChatPrivado";

export const MensajesAreaSocial: React.FC = () => {
  usePageTitle("Mensajes");

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"social" | "privado">("social");

  const initialUserId = searchParams.get("userId");
  const initialUserName = searchParams.get("userName");

  // Si vienen query params del botón "Contactar", abrir tab privado
  useEffect(() => {
    if (initialUserId) {
      setActiveTab("privado");
    }
  }, [initialUserId]);

  const {
    messages, inputValue, setInputValue, connected, currentUser,
    chatAreaRef, sendMessage, handleKeyDown, formatTime, isMine,
  } = useChatSocial();

  return (
    <div
      className="w-full h-[calc(105vh-100px)] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <ChatHeader connected={connected} />

      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "social" ? (
        <ChatSocial
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          connected={connected}
          currentUser={currentUser}
          chatAreaRef={chatAreaRef}
          sendMessage={sendMessage}
          handleKeyDown={handleKeyDown}
          formatTime={formatTime}
          isMine={isMine}
        />
      ) : (
        <ChatPrivado
          initialUserId={initialUserId ? Number(initialUserId) : undefined}
          initialUserName={initialUserName ?? undefined}
        />
      )}
    </div>
  );
};

export default MensajesAreaSocial;