import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import authService from "../../services/authService";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MediaType = "TEXT" | "IMAGE" | "VIDEO";

export interface MediaPreview {
  file: File;
  url: string;
  type: MediaType;
}
export interface PrivateMessage {
  id?: number;
  senderId: number;
  senderName: string;
  senderProfileImageUrl?: string;
  receiverId: number;
  content: string;
  mediaUrl?: string;
  mediaType: MediaType;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  /** ID del otro usuario */
  otherId: number;
  otherName: string;
  otherProfileImageUrl?: string;
  lastMessage: PrivateMessage;
  unread: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useChatPrivado = () => {
  const BASE_URL = import.meta.env.VITE_API_URL ?? "";
  const currentUser = authService.getCurrentUser();

  // Lista de conversaciones (panel izquierdo)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Mensajes de la conversación abierta
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  // ID del usuario con quien se está chateando
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Preview del archivo seleccionado antes de enviar
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Scroll automático ─────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ─── Cargar lista de conversaciones ────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/private/conversations`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data: PrivateMessage[] = await res.json();

      // Construir objeto Conversation a partir del último mensaje de cada hilo
      const convMap = new Map<number, Conversation>();
      data.forEach((msg) => {
        const otherId =
          msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId;
        const otherName =
          msg.senderId === currentUser?.id
            ? `Usuario ${msg.receiverId}`
            : msg.senderName;
        const otherProfileImageUrl =
          msg.senderId === currentUser?.id
            ? undefined
            : msg.senderProfileImageUrl;

        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            otherId,
            otherName,
            otherProfileImageUrl,
            lastMessage: msg,
            unread: !msg.read && msg.receiverId === currentUser?.id ? 1 : 0,
          });
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    }
  }, [BASE_URL, currentUser?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ─── Abrir conversación con un usuario ────────────────────────────────
  const openConversation = useCallback(
    async (otherId: number, otherNameFallback?: string) => {
      setActiveUserId(otherId);
      setMessages([]);
      try {
        const res = await fetch(
          `${BASE_URL}/api/chat/private/history/${otherId}`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data: PrivateMessage[] = await res.json();
          setMessages(data);
        }

        // Si no existe en la lista, agregar entrada placeholder
        setConversations((prev) => {
          const exists = prev.some((c) => c.otherId === otherId);
          if (!exists && otherNameFallback) {
            const placeholder: Conversation = {
              otherId,
              otherName: otherNameFallback,
              otherProfileImageUrl: undefined,
              lastMessage: {
                id: undefined,
                senderId: otherId,
                senderName: otherNameFallback,
                receiverId: currentUser?.id ?? 0,
                content: "",
                mediaType: "TEXT",
                timestamp: new Date().toISOString(),
                read: true,
              },
              unread: 0,
            };
            return [placeholder, ...prev];
          }
          return prev.map((c) =>
            c.otherId === otherId ? { ...c, unread: 0 } : c,
          );
        });
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    },
    [BASE_URL, currentUser?.id],
  );

  // ─── Conectar WebSocket ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/chat-socket`),
      debug: () => {},
      reconnectDelay: 0,
      onConnect: () => {
        setConnected(true);
        // Suscribirse al canal privado del usuario actual
        client.subscribe(`/user/${currentUser.id}/queue/private`, (frame) => {
          const msg: PrivateMessage = JSON.parse(frame.body);

          // Si el mensaje es de la conversación abierta → agregarlo
          setActiveUserId((currentActive) => {
            const isCurrentConv =
              msg.senderId === currentActive ||
              msg.receiverId === currentActive;

            if (isCurrentConv) {
              setMessages((prev) => {
                // Evitar duplicados (el remitente ya lo ve por confirmación)
                const exists = prev.some((m) => m.id === msg.id);
                return exists ? prev : [...prev, msg];
              });
            } else {
              // Incrementar badge de la conversación correspondiente
              const otherId =
                msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
              setConversations((prev) =>
                prev.map((c) =>
                  c.otherId === otherId
                    ? { ...c, unread: c.unread + 1, lastMessage: msg }
                    : c,
                ),
              );
            }
            return currentActive;
          });
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
  }, [BASE_URL, currentUser?.id]);

  // ─── Seleccionar archivo ───────────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return;

      const url = URL.createObjectURL(file);
      setMediaPreview({
        file,
        url,
        type: isImage ? "IMAGE" : "VIDEO",
      });
    },
    [],
  );

  const clearMediaPreview = useCallback(() => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [mediaPreview]);

  // ─── Enviar mensaje ────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!currentUser || !activeUserId || !stompClientRef.current?.active)
      return;
    const content = inputValue.trim();
    if (!content && !mediaPreview) return;

    let mediaUrl: string | undefined;
    let mediaType: MediaType = "TEXT";

    // Si hay archivo, subirlo primero
    if (mediaPreview) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", mediaPreview.file);
        const res = await fetch(`${BASE_URL}/api/chat/private/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error("Error al subir archivo");
        const data = await res.json();
        mediaUrl = data.mediaUrl;
        mediaType = data.mediaType as MediaType;
      } catch (err) {
        console.error("Error subiendo media:", err);
        setUploading(false);
        return;
      }
      setUploading(false);
      clearMediaPreview();
    }

    stompClientRef.current.publish({
      destination: "/app/private.send",
      body: JSON.stringify({
        senderId: String(currentUser.id),
        receiverId: String(activeUserId),
        content: content || "",
        mediaUrl: mediaUrl ?? null,
        mediaType,
      }),
    });

    setInputValue("");
  }, [
    inputValue,
    currentUser,
    activeUserId,
    mediaPreview,
    BASE_URL,
    clearMediaPreview,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  // ─── Utilidades ───────────────────────────────────────────────────────
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

  const isMine = (msg: PrivateMessage) =>
    currentUser != null && msg.senderId === currentUser.id;

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  // ─── Retorno ──────────────────────────────────────────────────────────
  return {
    conversations,
    messages,
    activeUserId,
    inputValue,
    setInputValue,
    connected,
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
    totalUnread,
    loadConversations,
  };
};
