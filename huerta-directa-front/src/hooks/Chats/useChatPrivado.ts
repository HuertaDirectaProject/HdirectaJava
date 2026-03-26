import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import authService from "../../services/authService";
import Swal from "sweetalert2";

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
  receiverName?: string;
  receiverProfileImageUrl?: string;
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
        const isMine = msg.senderId === currentUser?.id;
        const otherId = isMine ? msg.receiverId : msg.senderId;
        const otherName = isMine
          ? (msg.receiverName ?? `Usuario ${msg.receiverId}`)
          : msg.senderName;
        const otherProfileImageUrl = isMine
          ? msg.receiverProfileImageUrl
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

        // ← Recarga conversaciones desde el backend con datos completos
        await loadConversations();

        // Si aún no existe en la lista (primer contacto sin historial), agrega placeholder
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
    [BASE_URL, currentUser?.id, loadConversations], // ← agrega loadConversations
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
    client.subscribe(`/user/${currentUser.id}/queue/private`, (frame) => {
      const msg: PrivateMessage = JSON.parse(frame.body);

      setActiveUserId((currentActive) => {
        const isCurrentConv =
          msg.senderId === currentActive ||
          msg.receiverId === currentActive;

        if (isCurrentConv) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id);
            return exists ? prev : [...prev, msg];
          });
        } else {
          // ✅ Maneja conversación nueva Y existente
          const otherId =
            msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;

          setConversations((prev) => {
            const exists = prev.some((c) => c.otherId === otherId);

            if (exists) {
              return prev.map((c) =>
                c.otherId === otherId
                  ? { ...c, unread: c.unread + 1, lastMessage: msg }
                  : c,
              );
            } else {
              // Conversación nueva → agregar al inicio
              const newConv: Conversation = {
                otherId,
                otherName: msg.senderName ?? `Usuario ${otherId}`,
                otherProfileImageUrl: msg.senderProfileImageUrl,
                lastMessage: msg,
                unread: 1,
              };
              return [newConv, ...prev];
            }
          });
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
  const deleteConversation = useCallback(
    async (otherId: number) => {
      const isDark = document.documentElement.classList.contains("dark");

      const result = await Swal.fire({
        title: "¿Eliminar conversación?",
        text: "Solo tú dejarás de verla. El otro usuario no se verá afectado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e53e3e",
        cancelButtonColor: "#4caf50",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        background: isDark ? "#1a2e1a" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
        customClass: { popup: "rounded-3xl" },
      });

      if (!result.isConfirmed) return;

      try {
        const res = await fetch(
          `${BASE_URL}/api/chat/private/conversation/${otherId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        if (!res.ok) throw new Error();

        // Limpiar estado
        setConversations((prev) => prev.filter((c) => c.otherId !== otherId));
        if (activeUserId === otherId) {
          setActiveUserId(null);
          setMessages([]);
        }

        Swal.fire({
          icon: "success",
          title: "Conversación eliminada",
          timer: 1500,
          showConfirmButton: false,
          background: isDark ? "#1a2e1a" : "#ffffff",
          color: isDark ? "#ffffff" : "#1f2937",
          customClass: { popup: "rounded-3xl" },
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la conversación",
          confirmButtonColor: "#4caf50",
          background: isDark ? "#1a2e1a" : "#ffffff",
          color: isDark ? "#ffffff" : "#1f2937",
          customClass: { popup: "rounded-3xl" },
        });
      }
    },
    [BASE_URL, activeUserId],
  );

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
    deleteConversation,
  };
};
