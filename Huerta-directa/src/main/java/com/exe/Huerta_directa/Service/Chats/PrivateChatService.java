package com.exe.Huerta_directa.Service.Chats;

import org.springframework.web.multipart.MultipartFile;

import com.exe.Huerta_directa.DTO.Chats.PrivateMessageDTO;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface PrivateChatService {

    // Guardar mensaje de texto o con media (viene del WebSocket)
    PrivateMessageDTO saveMessage(Long senderId, Long receiverId,
            String content, String mediaUrl, String mediaType);

    // Historial entre dos usuarios
    List<PrivateMessageDTO> getConversation(Long userId, Long otherId);

    // Lista de conversaciones (último mensaje de cada una)
    List<PrivateMessageDTO> getConversations(Long userId);

    // Subir archivo y retornar { mediaUrl, mediaType }
    Map<String, String> uploadMedia(MultipartFile file) throws IOException;

    // Marcar mensajes como leídos
    void markAsRead(Long senderId, Long receiverId);

    // Contar no leídos
    long countUnread(Long userId);

    void deleteConversation(Long userId, Long otherId);
}