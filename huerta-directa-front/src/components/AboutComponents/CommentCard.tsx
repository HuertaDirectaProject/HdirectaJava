import { Button } from "../GlobalComponents/Button";
import {
  faArrowRight,
  faCommentDots,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { Comment } from "../../types/Comment";
import { API_URL } from "../../config/api";

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
}

export const CommentCard = ({ comment, currentUserId , onDelete }: CommentCardProps) => {
  const isOwner = currentUserId === comment.user.id;
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
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
          {comment.commentCommenter}
        </p>
      </div>

      {/* Acción */}
      <div className="flex justify-end">
        {isOwner ? (
          <div className="flex gap-2">
            <Button
              text="Editar"
              iconLetf={faPen}
              className="px-5 py-2 text-sm rounded-full bg-[#3e6a00]"
            />
            <Button
              text="Eliminar"
               onClick={() => onDelete?.(comment.idComment)} 
              iconLetf={faTrash}
              className="px-5 py-2 text-sm rounded-full bg-red-600 hover:bg-red-700"
            />
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
