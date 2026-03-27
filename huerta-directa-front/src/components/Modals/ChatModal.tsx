import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  onClose: () => void;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const ChatModal = ({ onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("huerta_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number | string>("desconocido");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev ? `${prev} ${finalTranscript}` : finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Tu navegador no soporta reconocimiento de voz.");
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem("huerta_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch products");
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTotalProducts(data.length);
        }
      })
      .catch((err) => console.error("Error fetching total products for AI context", err));
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!GROQ_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: No se ha configurado la API Key de Groq." },
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use proxy in dev, direct URL in prod (though prod will likely need a real backend proxy for CORS)
      const isDev = import.meta.env.DEV;
      const apiUrl = isDev 
        ? "/groq/chat/completions" 
        : "https://api.groq.com/openai/v1/chat/completions";

      console.log(`Sending request to Groq (${isDev ? "proxy" : "direct"}) with key:`, GROQ_API_KEY ? "Present" : "Missing");
      
      const response = await axios.post(
        apiUrl,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Eres un Asistente Experto en Horticultura y Huerta Orgánica. Tu objetivo es responder todas las preguntas del usuario sobre cultivos, siembra, plagas, suelos, cosechas y productos agrícolas. Utiliza un tono amigable, didáctico y enfocado en métodos sostenibles. Eres también el guía experto de la plataforma Huerta Directa.

Información en tiempo real para tus respuestas:
- Total de productos actualmente registrados en la plataforma: ${totalProducts}.

Guía visual de la plataforma (Explícale al usuario DÓNDE HACER CLIC, NO le digas rutas ni URLs bajo ninguna circunstancia):
- Para ver el catálogo de productos: "Ve al menú principal y haz clic en 'Productos' o 'Catálogo'".
- Para ver compras, métricas o el panel personal: "Haz clic en el ícono de tu perfil en la parte superior y entra a tu Dashboard".
- Para ver productos favoritos: "Entra a tu Dashboard y busca la sección 'Mis Favoritos' o el ícono de corazón".
- Para agregar un producto para vender: "Ve a tu Dashboard y haz clic en el botón 'Agregar Producto' (tiene un ícono de caja abierta). Llena todo el formulario con el nombre, precio, categoría, descripción, pon tu cantidad en stock (máximo 100 en el sistema) y sube una fotografía de tu cultivo. Al finalizar dale al botón de Publicar y tendras que esperar la verificacion de un administrador para que tu producto sea visible para los clientes".
- Para administrar la plataforma (solo admins): "Desde tu cuenta de administrador, ve al dashboard de administración principal donde verás gráficas, usuarios y la gestión global".
- Para saber sobre el proyecto: "Ve al menú y haz clic en el enlace 'Quiénes Somos'".

Utiliza esta información para explicarle paso a paso con botones o menús si el usuario te pregunta "¿cómo agrego un producto?", "¿dónde veo mis favoritos?", etc. Responde siempre de forma amigable, práctica y concisa. NO hables de otros temas fuera de lo agrícola o de la plataforma.`,
            },
            ...messages,
            userMessage,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Groq response received:", response.data);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] animate-fadeIn">
      {/* CONTENEDOR */}
      <div className="bg-white dark:bg-[#1A221C] w-[90%] max-w-2xl h-[80%] rounded-xl shadow-2xl flex flex-col overflow-hidden m-4">
        
        {/* HEADER */}
        <div className="bg-[#8dc84b] text-white px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h1 className="text-lg font-semibold">Asistente Huerta</h1>
              <p className="text-xs opacity-90">IA Activa</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 w-10 h-10 flex items-center justify-center rounded-lg text-lg transition duration-300 cursor-pointer"
          >
            ❌
          </button>
        </div>

        {/* MENSAJES */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111814] p-6 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
                ¡Hola! Soy Huerta-IA
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ¿En qué puedo ayudarte hoy sobre productos del campo?
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#8dc84b] text-white rounded-tr-none"
                      : "bg-white dark:bg-[#222b24] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#222b24] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="bg-white dark:bg-[#1A221C] border-t border-gray-100 dark:border-[#2a332c] p-4">
          <div className="flex gap-3">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Escribe tu mensaje..."
              className="flex-1 border border-gray-200 dark:border-[#2a332c] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#8dc84b] focus:border-transparent bg-gray-50 dark:bg-[#222b24] text-gray-800 dark:text-gray-200 transition-all"
            />
            <button
              onClick={toggleListen}
              title={isListening ? "Detener micrófono" : "Hablar"}
              type="button"
              className={`px-4 rounded-xl shadow-md transition duration-300 cursor-pointer flex items-center justify-center text-lg ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "bg-gray-100 dark:bg-[#2a332c] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#323d35]"
              }`}
            >
              🎤
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-[#8dc84b] px-5 rounded-xl text-white hover:bg-[#7ab63f] disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 cursor-pointer shadow-md"
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
