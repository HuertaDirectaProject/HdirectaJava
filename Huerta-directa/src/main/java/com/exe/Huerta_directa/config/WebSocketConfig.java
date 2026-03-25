package com.exe.Huerta_directa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat-socket")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // /topic  → chat social (broadcast, sin cambios)
        // /user   → chat privado (enrutamiento por ID de usuario)
        registry.enableSimpleBroker("/topic", "/user");

        // Prefijo de destinos de aplicación (no cambia)
        registry.setApplicationDestinationPrefixes("/app");

        // Necesario para que convertAndSendToUser use /user/{id}/queue/private
        registry.setUserDestinationPrefix("/user");
    }
}