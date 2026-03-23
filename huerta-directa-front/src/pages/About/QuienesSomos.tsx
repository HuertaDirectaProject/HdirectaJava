import { useState, useEffect } from "react";
import { AboutSection } from "../../components/AboutComponents/AboutSection";
import { ForumSection } from "../../components/AboutComponents/ForumSection";
import commentService from "../../services/commentservice"; // 👈 ajusta el path
import type { Comment } from "../../types/Comment";
import authService from "../../services/authService";


const QuienesSomos = () => {
  const [comments, setComments] = useState<Comment[]>([]);
    const currentUser = authService.getCurrentUser();

  const fetchComments = async () => {
    try {
      const data = await commentService.getSiteComments();
      setComments(data as Comment[]);
    } catch (err) {
      console.error("Error cargando comentarios", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div>
      <AboutSection onCommentCreated={fetchComments} />
      <ForumSection comments={comments} userRole=""  currentUserId={currentUser?.id}  onCommentDeleted={fetchComments} />
    </div>
  );
};

export default QuienesSomos;