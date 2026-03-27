package com.exe.Huerta_directa.Impl.Chat;

import com.exe.Huerta_directa.DTO.Chats.PrivateMessageDTO;
import com.exe.Huerta_directa.Entity.Chats.PrivateMessage;
import com.exe.Huerta_directa.Entity.Chats.PrivateMessage.MediaType;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Repository.Chats.PrivateMessageRepository;
import com.exe.Huerta_directa.Service.Chats.PrivateChatService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PrivateChatServiceImpl implements PrivateChatService {

    private final PrivateMessageRepository privateMessageRepository;
    private final UserRepository userRepository;

    @Value("${upload.path}")
    private String uploadPath;

    // ── Guardar mensaje ────────────────────────────────────────────────────

    @Override
    public PrivateMessageDTO saveMessage(Long senderId, Long receiverId,
            String content, String mediaUrl, String mediaTypeStr) {

        MediaType mediaType = (mediaTypeStr != null)
                ? MediaType.valueOf(mediaTypeStr.toUpperCase())
                : MediaType.TEXT;

        PrivateMessage message = PrivateMessage.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();

        PrivateMessage saved = privateMessageRepository.save(message);
        return toDTO(saved);
    }

    // ── Historial ──────────────────────────────────────────────────────────

    @Override
    public List<PrivateMessageDTO> getConversation(Long userId, Long otherId) {
        // Marcar como leídos los mensajes que el otro me envió
        privateMessageRepository.markAsRead(otherId, userId);
        return privateMessageRepository.findConversation(userId, otherId)
                .stream().map(this::toDTO).toList();
    }

    // ── Lista de conversaciones ────────────────────────────────────────────

    @Override
    public List<PrivateMessageDTO> getConversations(Long userId) {
        return privateMessageRepository.findLastMessagePerConversation(userId)
                .stream().map(this::toDTO).toList();
    }

    // ── Subir archivo ──────────────────────────────────────────────────────

    @Override
    public Map<String, String> uploadMedia(MultipartFile file) throws IOException {

        // Determinar tipo
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String mediaType;
        if (contentType.startsWith("image/")) {
            mediaType = "IMAGE";
        } else if (contentType.startsWith("video/")) {
            mediaType = "VIDEO";
        } else {
            throw new IllegalArgumentException("Solo se permiten imágenes y videos");
        }

        // Crear carpeta igual que ProductController
        File folder = new File(uploadPath, "chat-privado");
        if (!folder.exists())
            folder.mkdirs();

        // Nombre único
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File dest = new File(folder, filename);
        file.transferTo(dest);

        String mediaUrl = "/uploads/chat-privado/" + filename;

        Map<String, String> result = new HashMap<>();
        result.put("mediaUrl", mediaUrl);
        result.put("mediaType", mediaType);
        return result;
    }

    // ── Marcar leídos ──────────────────────────────────────────────────────

    @Override
    public void markAsRead(Long senderId, Long receiverId) {
        privateMessageRepository.markAsRead(senderId, receiverId);
    }

    // ── Contar no leídos ──────────────────────────────────────────────────

    @Override
    public long countUnread(Long userId) {
        return privateMessageRepository.countUnread(userId);
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private PrivateMessageDTO toDTO(PrivateMessage m) {
        PrivateMessageDTO dto = new PrivateMessageDTO();
        dto.setId(m.getId());
        dto.setSenderId(m.getSenderId());
        dto.setReceiverId(m.getReceiverId());
        dto.setContent(m.getContent());
        dto.setMediaUrl(m.getMediaUrl());
        dto.setMediaType(m.getMediaType());
        dto.setTimestamp(m.getTimestamp());
        dto.setRead(m.isRead());

        // Enriquecer con datos del remitente si existe
        userRepository.findById(m.getSenderId()).ifPresent(user -> {
            dto.setSenderName(user.getName());
            dto.setSenderProfileImageUrl(user.getProfileImageUrl());
            dto.setSenderRole(user.getRole() != null ? user.getRole().getIdRole().intValue() : null);
        });

        userRepository.findById(m.getReceiverId()).ifPresent(user -> {
            dto.setReceiverName(user.getName());
            dto.setReceiverProfileImageUrl(user.getProfileImageUrl());
            dto.setReceiverRole(user.getRole() != null ? user.getRole().getIdRole().intValue() : null);
        });

        return dto;
    }

    @Override
    @Transactional
    public void deleteConversation(Long userId, Long otherId) {
        privateMessageRepository.softDeleteForUser(userId, otherId);
    }

}
