import { Button } from "../GlobalComponents/Button";
import { faArrowRight, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import type { Comment } from "../../types/Comment";
import { API_URL } from "../../config/api"; 

interface ForumSectionProps {
  comments: Comment[];
  userRole: string;
}

// 👈 agrega esta función antes del componente
const getImageSrc = (imageUrl?: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return `${API_URL}${imageUrl}`;
};
export const ForumSection = ({ comments }: ForumSectionProps) => {
  return (
    <section className="max-w-full py-10 bg-white dark:bg-[#1A221C] transition-colors duration-500">
      <div className="bg-white dark:bg-[#111814] max-w-350 mx-auto my-20 p-8 rounded-xl shadow-lg transition-colors duration-500">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-4">
            Foro De Huerta Directa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comments.map((comment) => (
              <div
                key={comment.idComment} // 👈 era comment.id
                className="bg-[#eaf5e7] dark:bg-[#111814] rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] ease-in-out cursor-pointer group"
              >
                <div className="flex items-start space-x-4 mb-4">
                   <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#8bc34a]">
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

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                          {comment.commentType === "SITE"
                            ? "Comentario del sitio"
                            : "Comentario del producto"}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {comment.user.name}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(comment.creationComment).toLocaleDateString(
                        "es-CO",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>

                    <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-3 break-all whitespace-normal max-w-75">
                      {comment.commentCommenter}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    text="Responder"
                    iconLetf={faCommentDots}
                    iconRight={faArrowRight}
                    className="px-4 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
