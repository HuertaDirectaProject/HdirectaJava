import React, { useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useChatSocial } from "../../hooks/Chats/useChatSocial"; // ajusta el path
import ChatTabs from "../../components/Dashboard/Chats/ChatTabs";
import ChatHeader from "../../components/Dashboard/Chats/ChatHeader";
import ChatSocial from "../../components/Dashboard/Chats/ChatSocial";
import ChatPrivado from "../../components/Dashboard/Chats/ChatPrivado";

export const MensajesAreaSocial: React.FC = () => {
  usePageTitle("Mensajes");

  const [activeTab, setActiveTab] = useState<"social" | "privado">("social");

  // ← todo lo que era lógica ahora viene del hook
  const {
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
  } = useChatSocial();

  return (
    <div
      className="w-full h-[calc(100vh-100px)] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <ChatHeader connected={connected} />

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Contenido según tab ───────────────────────────────────────────── */}
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
        /* ── Placeholder mensajes privados ────────────────────────────── */
        <ChatPrivado />
      )}
    </div>
  );
};

export default MensajesAreaSocial;
