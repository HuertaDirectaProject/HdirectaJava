import Swal from "sweetalert2";
import type { Comment } from "../../types/Comment";
import { ThemeToggle } from "../GlobalComponents/ThemeToggle";
import { CommentCard } from "./CommentCard";
import commentService from "../../services/commentservice";

interface ForumSectionProps {
  comments: Comment[];
  userRole: string;
  currentUserId?: number;
  onCommentDeleted: () => void; 
}

export const ForumSection = ({
  comments,
  currentUserId,
  onCommentDeleted
}: ForumSectionProps) => {
  const handleDelete = async (id: number) => {
  const isDark = document.documentElement.classList.contains("dark");

  const confirm = await Swal.fire({
    title: "¿Eliminar comentario?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    background: isDark ? "#1A221C" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    customClass: {
      popup: "rounded-3xl",
    },
  });

  if (!confirm.isConfirmed) return;

  try {
    await commentService.deleteComment(id);
    onCommentDeleted();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el comentario",
      confirmButtonColor: "#ef4444",
      background: isDark ? "#1A221C" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
      customClass: {
        popup: "rounded-3xl",
      },
    });
  }
};
  return (
    <section className="max-w-full py-10 bg-linear-to-b from-[#FEF5DC] via-white to-[#FEF5DC]  dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C]  transition-colors duration-500">
      <div className="bg-white dark:bg-[#111814] max-w-350 mx-auto my-20 p-8 rounded-xl shadow-lg transition-colors duration-500">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-4">
            Foro De Huerta Directa
            {/* Theme */}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comments.map((comment) => (
              <CommentCard
                key={comment.idComment}
                comment={comment}
                currentUserId={currentUserId}
                onDelete={handleDelete} 
              /> 
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
