package com.exe.Huerta_directa.Controllers.Chats;

import com.exe.Huerta_directa.Entity.Chats.ChatSocialMessage;
import com.exe.Huerta_directa.Service.Chats.ChatSocialService;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatSocialService chatService;

    @MessageMapping("/sendMessage")
    public void receiveMessage(@Payload Map<String, String> msg) {

        // RECIBE EL MENSAJE DEL CLIENTE
        String sender = msg.get("sender");
        String content = msg.get("content");
        Long userId = Long.parseLong(msg.get("userId"));

        // 1. GUARDAR EN BD
        ChatSocialMessage saved = chatService.saveMessage(userId, sender, content);

        // 2. ENVIAR A TODOS LOS CLIENTES ACTUALES
        messagingTemplate.convertAndSend("/topic/messages", saved);
    }
}
