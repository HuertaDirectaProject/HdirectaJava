import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useChatSocial } from "../../hooks/useChatSocial"; // ajusta el path
import ChatTabs from "../../components/Dashboard/Chats/ChatTabs";
import ChatHeader from "../../components/Dashboard/Chats/ChatHeader";
import ChatSocial from "../../components/Dashboard/Chats/ChatSocial";

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
        <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)" }}
          >
            <FontAwesomeIcon
              icon={faLock}
              className="text-green-500 text-2xl"
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-gray-700 mb-1">
              Mensajes Privados
            </p>
            <p className="text-sm text-gray-400 font-medium max-w-xs">
              Pronto podrás chatear directamente con compradores y vendedores de
              forma privada.
            </p>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            Próximamente
          </span>
        </div>
      )}
    </div>
  );
};

export default MensajesAreaSocial;
