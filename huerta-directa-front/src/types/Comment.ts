export interface Comment {
  idComment: number;
  commentType: "SITE" | "PRODUCT";
  commentCommenter: string;
  creationComment: string;
  user: {
    name: string;
    profileImageUrl?: string; 
  };
}