package com.exe.Huerta_directa.Controllers.Chats;


import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.exe.Huerta_directa.DTO.Chats.PrivateMessageDTO;
import com.exe.Huerta_directa.Service.Chats.PrivateChatService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PrivateChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final PrivateChatService privateChatService;

    /**
     * El cliente envía a: /app/private.send
     * Payload esperado:
     * {
     *   "senderId":   1,
     *   "receiverId": 2,
     *   "content":    "Hola!",
     *   "mediaUrl":   null,       <- null si es texto puro
     *   "mediaType":  "TEXT"      <- TEXT | IMAGE | VIDEO
     * }
     */
    @MessageMapping("/private.send")
    public void sendPrivateMessage(@Payload Map<String, String> payload) {

        Long senderId   = Long.parseLong(payload.get("senderId"));
        Long receiverId = Long.parseLong(payload.get("receiverId"));
        String content  = payload.get("content");
        String mediaUrl = payload.get("mediaUrl");
        String mediaType = payload.getOrDefault("mediaType", "TEXT");

        // Guardar en BD
        PrivateMessageDTO saved = privateChatService.saveMessage(
                senderId, receiverId, content, mediaUrl, mediaType);

        // Entregar al destinatario → /user/{receiverId}/queue/private
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/private",
                saved);

        // Confirmar al remitente (para que vea su propio mensaje en tiempo real)
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/private",
                saved);
    }
}
