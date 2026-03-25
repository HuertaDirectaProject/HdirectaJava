package com.exe.Huerta_directa.Repository.Chats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.exe.Huerta_directa.Entity.Chats.PrivateMessage;

import java.util.List;

@Repository
public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {

    // Historial entre dos usuarios ordenado por fecha
    @Query("""
        SELECT m FROM PrivateMessage m
        WHERE (m.senderId = :userId AND m.receiverId = :otherId)
           OR (m.senderId = :otherId AND m.receiverId = :userId)
        ORDER BY m.timestamp ASC
    """)
    List<PrivateMessage> findConversation(@Param("userId") Long userId,
                                          @Param("otherId") Long otherId);

    // Último mensaje de cada conversación del usuario
    @Query(value = """
        SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)) *
        FROM private_messages
        WHERE sender_id = :userId OR receiver_id = :userId
        ORDER BY LEAST(sender_id, receiver_id),
                 GREATEST(sender_id, receiver_id),
                 timestamp DESC
    """, nativeQuery = true)
    List<PrivateMessage> findLastMessagePerConversation(@Param("userId") Long userId);

    // Marcar mensajes como leídos
    @Modifying
    @Transactional
    @Query("""
        UPDATE PrivateMessage m SET m.read = true
        WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.read = false
    """)
    void markAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    // Contar no leídos para badge
    @Query("""
        SELECT COUNT(m) FROM PrivateMessage m
        WHERE m.receiverId = :userId AND m.read = false
    """)
    long countUnread(@Param("userId") Long userId);
}