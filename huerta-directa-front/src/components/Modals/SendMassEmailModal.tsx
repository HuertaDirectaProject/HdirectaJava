import React, { useState } from "react";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SendMassEmailModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [recipientGroup, setRecipientGroup] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    "Hola,\n\nNos ponemos en contacto contigo desde Huerta Directa para informarte sobre las últimas novedades de nuestra plataforma.\n\nGracias por ser parte de nuestra comunidad.\n\nAtentamente,\nEl Equipo de Huerta Directa",
  );
  const [bcc, setBcc] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      Swal.fire({
        title: "Campos Vacíos",
        text: "Por favor, ingresa el asunto y el cuerpo del mensaje.",
        icon: "warning",
        confirmButtonColor: "#8dc84b",
      });
      return;
    }

    setIsSending(true);

    try {
      let endpoint = "";
      let payload: any = { subject, body };

      // Agregar BCC si el usuario ingresó algún email
      if (bcc.trim()) {
        payload.bcc = bcc.split(",").map((e) => e.trim()).filter(Boolean);
      }

      if (recipientGroup === "all") {
        endpoint = `${API_URL}/api/users/send-bulk-email`;
      } else if (recipientGroup === "admins") {
        endpoint = `${API_URL}/api/users/send-bulk-email-by-role`;
        payload = { ...payload, idRole: 1 };
      } else if (recipientGroup === "clients") {
        endpoint = `${API_URL}/api/users/send-bulk-email-by-role`;
        payload = { ...payload, idRole: 2 };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "¡Correos Enviados!",
          text: data.message || `Se enviaron los correos a ${data.totalSent ?? ""} destinatarios.`,
          icon: "success",
          confirmButtonColor: "#8dc84b",
        });
        onClose();
      } else {
        Swal.fire({
          title: "Error al enviar",
          text: data.message || "Ocurrió un error al intentar enviar los correos.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error sending mass email:", error);
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor. Verifica tu conexión.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A221C] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
        <div className="bg-[#004d00] p-6 text-white text-center rounded-t-3xl relative">
          <h2 className="text-2xl font-extrabold uppercase tracking-wider">
            Correos Masivos
          </h2>
          <button
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-6 text-white/50 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Destinatarios */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Destinatarios
            </label>
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              className="w-full border-2 border-gray-100 dark:border-[#2a332c] bg-gray-50 dark:bg-[#1f2a22] text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8dc84b] transition-all"
            >
              <option value="all">Todos los usuarios (Clientes, Admins)</option>
              <option value="clients">Solo Clientes</option>
              <option value="admins">Solo Administradores</option>
            </select>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Asunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-2 border-gray-100 dark:border-[#2a332c] bg-gray-50 dark:bg-[#1f2a22] text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8dc84b] transition-all"
              placeholder="Ej: Novedades de Huerta Directa"
            />
          </div>

          {/* BCC */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Con copia oculta (BCC) <span className="font-normal text-gray-400">— opcional, separar por comas</span>
            </label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              className="w-full border-2 border-gray-100 dark:border-[#2a332c] bg-gray-50 dark:bg-[#1f2a22] text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8dc84b] transition-all"
              placeholder="email1@ejemplo.com, email2@ejemplo.com"
            />
          </div>

          {/* Cuerpo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Cuerpo del Mensaje
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full border-2 border-gray-100 dark:border-[#2a332c] bg-gray-50 dark:bg-[#1f2a22] text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8dc84b] transition-all resize-none"
            ></textarea>
            <p className="text-xs text-gray-400 mt-2">
              Nota: El mensaje se enviará con el diseño corporativo de Huerta Directa.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1f2a22] p-6 flex justify-end gap-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-[#2a332c] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-8 py-3 rounded-xl font-bold text-white bg-[#8dc84b] hover:bg-[#7ab63f] disabled:opacity-50 transition-all shadow-md"
          >
            {isSending ? "Enviando..." : "Enviar Correos"}
          </button>
        </div>
      </div>
    </div>
  );
};
