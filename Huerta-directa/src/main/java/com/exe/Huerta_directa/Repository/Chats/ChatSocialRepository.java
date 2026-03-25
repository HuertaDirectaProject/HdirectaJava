package com.exe.Huerta_directa.Repository.Chats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exe.Huerta_directa.Entity.Chats.ChatSocialMessage;

import java.util.List;

@Repository
public interface ChatSocialRepository extends JpaRepository<ChatSocialMessage, Long> {

    // Para traer los mensajes ordenados del más viejo al más nuevo
    List<ChatSocialMessage> findAllByOrderByTimestampAsc();

    List<ChatSocialMessage> findByUserIdOrderByTimestampAsc(Long userId);
}
