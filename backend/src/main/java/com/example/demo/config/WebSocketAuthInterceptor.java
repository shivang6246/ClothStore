package com.example.demo.config;

import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Intercepts STOMP CONNECT frames to authenticate users via JWT.
 * The token is passed in the "Authorization" STOMP header.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                try {
                    String userEmail = jwtService.extractUsername(jwt);
                    if (userEmail != null && jwtService.isTokenValid(jwt, userEmail)) {
                        String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
                        if (role == null) role = "CUSTOMER";

                        List<SimpleGrantedAuthority> authorities =
                                List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        UserDetails userDetails = User.withUsername(userEmail)
                                .password("")
                                .authorities(authorities)
                                .build();

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                        accessor.setUser(authToken);
                        log.debug("WebSocket CONNECT authenticated: {}", userEmail);
                    }
                } catch (Exception e) {
                    log.warn("WebSocket JWT auth failed: {}", e.getMessage());
                }
            }
        }
        return message;
    }
}
