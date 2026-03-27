import { Button } from "../GlobalComponents/Button";
import {
  faArrowRight,
  faCommentDots,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { Comment } from "../../types/Comment";
import { API_URL } from "../../config/api";
import { useState } from "react";
import Swal from "sweetalert2";
import commentService from "../../services/commentservice";

const getImageSrc = (imageUrl?: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${API_URL}${imageUrl}`;
};

interface CommentCardProps {
  comment: Comment;
  currentUserId?: number;
  onDelete?: (id: number) => void;
  onEdit?: () => void; 
}

export const CommentCard = ({
  comment,
  currentUserId,
  onDelete,
  onEdit
}: CommentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentCommenter);
  const [saving, setSaving] = useState(false);
  const isOwner = currentUserId === comment.user.id;

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    const isDark = document.documentElement.classList.contains("dark");

    try {
      await commentService.updateComment(comment.idComment, editText);
      setIsEditing(false);
      onEdit?.(); // recarga la lista
      Swal.fire({
        icon: "success",
        title: "Comentario actualizado",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#1A221C" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
        iconColor: "#8dc84b",
        customClass: { popup: "rounded-3xl" },
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el comentario",
        confirmButtonColor: "#8dc84b",
        background: isDark ? "#1A221C" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
        customClass: { popup: "rounded-3xl" },
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="bg-white dark:bg-[#1a1f1b] rounded-2xl shadow-md p-6 flex flex-col gap-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-100 dark:border-white/10">
      {/* Header — avatar + nombre + fecha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#8dc84b] flex items-center justify-center bg-[#8bc34a]">
              {getImageSrc(comment.user.profileImageUrl) ? (
                <img
                  src={getImageSrc(comment.user.profileImageUrl)!}
                  alt={comment.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold uppercase leading-none">
                  {comment.user.name.charAt(0)}
                </span>
              )}
            </div>
            {/* Badge online */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#3e6a00] rounded-full border-2 border-white dark:border-[#1a1f1b]" />
          </div>

          {/* Nombre + tipo */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                {comment.user.name}
              </h3>
              <span className="bg-[#eaf5e7] dark:bg-[#2a3a2a] text-[#3e6a00] dark:text-[#8dc84b] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {comment.commentType === "SITE" ? "Sitio" : "Producto"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 font-medium">
              {new Date(comment.creationComment).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje */}
      <div className="bg-[#f2f5e6] dark:bg-[#111814] rounded-xl p-4">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#8dc84b] rounded-lg p-1"
          />
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {editText}
          </p>
        )}
      </div>

      {/* Acción */}
      <div className="flex justify-end">
        {isOwner ? (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  text="Guardar"
                  isLoading={saving}
                  loadingText="Guardando..."
                  onClick={handleSave}
                  className="px-5 py-2 text-sm rounded-full bg-[#3e6a00]"
                />
                <Button
                  text="Cancelar"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.commentCommenter);
                  }}
                  className="px-5 py-2 text-sm rounded-full bg-gray-500"
                />
              </>
            ) : (
              <>
                <Button
                  text="Editar"
                  iconLetf={faPen}
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 text-sm rounded-full bg-[#3e6a00]"
                />
                <Button
                  text="Eliminar"
                  iconLetf={faTrash}
                  onClick={() => onDelete?.(comment.idComment)}
                  className="px-5 py-2 text-sm rounded-full bg-red-600 hover:bg-red-700"
                />
              </>
            )}
          </div>
        ) : (
          <Button
            text="Responder"
            iconLetf={faCommentDots}
            iconRight={faArrowRight}
            className="px-5 py-2 text-sm rounded-full"
          />
        )}
      </div>
    </div>
  );
};
