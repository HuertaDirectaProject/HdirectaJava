package com.exe.Huerta_directa.Service.Chats;

import java.util.List;

import com.exe.Huerta_directa.Entity.Chats.ChatSocialMessage;

public interface ChatSocialService {

    ChatSocialMessage saveMessage(Long userId, String senderName, String content);

    List<ChatSocialMessage> getAllMessages();

    List<ChatSocialMessage> getMessagesByUser(Long userId);
}