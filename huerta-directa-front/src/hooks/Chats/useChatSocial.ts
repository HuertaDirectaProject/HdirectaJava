import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import authService from "../../services/authService";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id?: number;
  senderName: string;
  content: string;
  timestamp: string;
  userId: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useChatSocial = () => {
  const BASE_URL = import.meta.env.VITE_API_URL ?? "";
  const currentUser = authService.getCurrentUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [connected, setConnected] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // ─── Scroll automático ───────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ─── Cargar historial inicial ────────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`${BASE_URL}/MensajesAreaSocial/mensajes`, {
          credentials: "include",
        });
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };
    loadHistory();
  }, [BASE_URL]);

  // ─── Conectar WebSocket ──────────────────────────────────────────────────
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/chat-socket`),
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/messages", (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [BASE_URL]);

  // ─── Auto-limpiar mensajes mayores a 5 minutos ───────────────────────────
  useEffect(() => {
    const CINCO_MINUTOS = 5 * 60 * 1000;

    const interval = setInterval(() => {
      const ahora = Date.now();
      setMessages((prev) =>
        prev.filter((msg) => {
          const tiempoMensaje = new Date(msg.timestamp).getTime();
          return ahora - tiempoMensaje < CINCO_MINUTOS;
        })
      );
    }, 60_000); // revisa cada minuto

    return () => clearInterval(interval);
  }, []);

  // ─── Enviar mensaje ──────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const content = inputValue.trim();
    if (!content || !stompClientRef.current?.active || !currentUser) return;

    stompClientRef.current.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify({
        sender: currentUser.name,
        content,
        userId: currentUser.id,
      }),
    });

    setInputValue("");
  }, [inputValue, currentUser]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ─── Utilidades ──────────────────────────────────────────────────────────
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const isMine = (msg: ChatMessage) =>
    currentUser != null && msg.userId === currentUser.id;

  // ─── Retorno ─────────────────────────────────────────────────────────────
  return {
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
  };
};