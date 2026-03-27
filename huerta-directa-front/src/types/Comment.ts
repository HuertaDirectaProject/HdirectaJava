export interface Comment {
  idComment: number;
  commentType: "SITE" | "PRODUCT";
  commentCommenter: string;
  creationComment: string;
  user: {
    id: number;
    name: string;
    profileImageUrl?: string; 
  };
}