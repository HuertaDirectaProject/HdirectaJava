import { useState, useEffect } from "react";
import { AboutSection } from "../../components/AboutComponents/AboutSection";
import { ForumSection } from "../../components/AboutComponents/ForumSection";
import commentService from "../../services/commentservice"; // 👈 ajusta el path
import type { Comment } from "../../types/Comment";



const QuienesSomos = () => {
  const [comments, setComments] = useState<Comment[]>([]);

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
      <ForumSection comments={comments} userRole="" />
    </div>
  );
};

export default QuienesSomos;