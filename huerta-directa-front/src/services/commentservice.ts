import { API_URL } from "../config/api";

/* ========================== TYPES ========================== */

export interface Comment {
  idComment: number;
  commentCommenter: string;
  creationComment: string;
  commentType: "SITE" | "PRODUCT";
  rating?: number;
  userName?: string;
  productId?: number;
}

export interface CreateCommentPayload {
  commentCommenter: string;
  productId?: number;
  rating?: number;
}

export interface UpdateCommentPayload {
  commentCommenter: string;
}

export interface CommentErrorResponse {
  message: string;
}

/* ========================== SERVICE ========================= */

class CommentService {
  private readonly BASE_URL = `${API_URL}/api/comments`;

  /**
   * Crear comentario (de sitio o de producto)
   */
  async createComment(payload: CreateCommentPayload): Promise<string> {
    const response = await this.safeFetch(`${this.BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Debes iniciar sesión para comentar");
      }
      const message = await this.extractErrorMessage(response, "Error al crear comentario");
      throw new Error(message);
    }

    return await response.text();
  }

  /**
   * Listar comentarios del sitio
   */
  async getSiteComments(): Promise<Comment[]> {
    const response = await this.safeFetch(`${this.BASE_URL}/site`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response, "Error al obtener comentarios del sitio");
      throw new Error(message);
    }

    return (await response.json()) as Comment[];
  }

  /**
   * Listar comentarios de un producto específico
   */
  async getProductComments(productId: number): Promise<Comment[]> {
    const response = await this.safeFetch(`${this.BASE_URL}/product/${productId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response, "Error al obtener comentarios del producto");
      throw new Error(message);
    }

    return (await response.json()) as Comment[];
  }

  /**
   * Actualizar comentario por ID
   */
  async updateComment(id: number, commentCommenter: string): Promise<string> {
    const payload: UpdateCommentPayload = { commentCommenter };

    const response = await this.safeFetch(`${this.BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Debes iniciar sesión para editar un comentario");
      }
      if (response.status === 403) {
        throw new Error("No tienes permiso para editar este comentario");
      }
      const message = await this.extractErrorMessage(response, "Error al actualizar comentario");
      throw new Error(message);
    }

    return await response.text();
  }

  /**
   * Eliminar comentario por ID
   */
  async deleteComment(id: number): Promise<void> {
    const response = await this.safeFetch(`${this.BASE_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Debes iniciar sesión para eliminar un comentario");
      }
      if (response.status === 403) {
        throw new Error("No tienes permiso para eliminar este comentario");
      }
      const message = await this.extractErrorMessage(response, "Error al eliminar comentario");
      throw new Error(message);
    }
  }

  /* ==================== HELPERS (igual que AuthService) ==================== */

  private async extractErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json();
      if (typeof data?.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data?.error === "string" && data.error.trim()) {
        return data.error;
      }
      return `${fallback} (HTTP ${response.status})`;
    } catch {
      return `${fallback} (HTTP ${response.status})`;
    }
  }

  private async safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(input, init);
    } catch {
      throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo y permita CORS.");
    }
  }
}

/* ========================== EXPORT ========================== */

const commentService = new CommentService();
export default commentService;