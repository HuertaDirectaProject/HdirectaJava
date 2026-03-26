package com.exe.Huerta_directa.DTO.Chats;

import lombok.*;

import java.time.LocalDateTime;

import com.exe.Huerta_directa.Entity.Chats.PrivateMessage.MediaType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrivateMessageDTO {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderProfileImageUrl;
    private Long receiverId;
    private String receiverName;              
    private String receiverProfileImageUrl;   
    private String content;
    private String mediaUrl;
    private MediaType mediaType;
    private LocalDateTime timestamp;
    private boolean read;
}