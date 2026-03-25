package com.exe.Huerta_directa.Controllers.Chats;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.exe.Huerta_directa.DTO.Chats.PrivateMessageDTO;
import com.exe.Huerta_directa.Service.Chats.PrivateChatService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat/private")
@RequiredArgsConstructor
public class PrivateChatController {

    private final PrivateChatService privateChatService;

    // ── GET historial con un usuario ──────────────────────────────────────
    @GetMapping("/history/{otherId}")
    public ResponseEntity<List<PrivateMessageDTO>> getHistory(
            @PathVariable Long otherId,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(privateChatService.getConversation(userId, otherId));
    }

    // ── GET lista de conversaciones ───────────────────────────────────────
    @GetMapping("/conversations")
    public ResponseEntity<List<PrivateMessageDTO>> getConversations(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(privateChatService.getConversations(userId));
    }

    // ── POST subir imagen o video ─────────────────────────────────────────
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            HttpSession session) throws IOException {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();

        Map<String, String> result = privateChatService.uploadMedia(file);
        return ResponseEntity.ok(result);
    }

    // ── GET contar no leídos (para badge en el tab) ───────────────────────
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> countUnread(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).build();

        long count = privateChatService.countUnread(userId);
        return ResponseEntity.ok(Map.of("unread", count));
    }
}