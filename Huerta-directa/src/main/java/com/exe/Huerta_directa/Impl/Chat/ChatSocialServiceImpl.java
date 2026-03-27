package com.exe.Huerta_directa.Impl.Chat;
import com.exe.Huerta_directa.Entity.Chats.ChatSocialMessage;
import com.exe.Huerta_directa.Repository.Chats.ChatSocialRepository;
import com.exe.Huerta_directa.Service.Chats.ChatSocialService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatSocialServiceImpl implements ChatSocialService {

    private final ChatSocialRepository repo;

    @Override
    public ChatSocialMessage saveMessage(Long userId, String senderName, String content) {

        ChatSocialMessage msg = new ChatSocialMessage();
        msg.setUserId(userId);
        msg.setSenderName(senderName);
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());

        return repo.save(msg);
    }

    @Override
    public List<ChatSocialMessage> getAllMessages() {
        return repo.findAllByOrderByTimestampAsc();
    }

    @Override
    public List<ChatSocialMessage> getMessagesByUser(Long userId) {
        return repo.findByUserIdOrderByTimestampAsc(userId);
    }
}
