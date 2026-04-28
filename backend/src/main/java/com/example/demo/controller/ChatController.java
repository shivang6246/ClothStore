package com.example.demo.controller;

import com.example.demo.dto.ChatMessageDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    /**
     * STOMP endpoint — receives a chat message from either customer or admin.
     * Saves it and broadcasts to:
     *   1. /topic/conversation/{conversationEmail} — both parties can listen
     *   2. /topic/admin/conversations — so admin list refreshes in real time
     */
    @MessageMapping("/chat.send")
    public void handleMessage(@Payload ChatMessageDTO dto, Principal principal) {
        if (principal == null) return;

        String senderEmail = principal.getName();
        dto.setSenderEmail(senderEmail);

        // Look up sender's name from DB
        Optional<User> user = userRepository.findByEmail(senderEmail);
        dto.setSenderName(user.map(User::getFullName).orElse(senderEmail));

        // Determine if sender is admin
        boolean isAdmin = user.map(u -> "ADMIN".equals(u.getRole())).orElse(false);
        dto.setFromAdmin(isAdmin);

        // For customers, conversation is always keyed to their own email
        // For admins, the conversationEmail should already be set in the DTO
        if (!isAdmin) {
            dto.setConversationEmail(senderEmail);
        }

        // Save to database
        ChatMessageDTO saved = chatService.saveMessage(dto);

        // Broadcast to the conversation channel
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + saved.getConversationEmail(), saved);

        // Notify admin list so it updates in real time
        messagingTemplate.convertAndSend("/topic/admin/conversations", saved);
    }

    // ── REST endpoints for loading history ────────────────────────────────────

    /**
     * GET /api/chat/conversations — admin only, returns latest message per conversation.
     */
    @GetMapping("/api/chat/conversations")
    public ResponseEntity<List<ChatMessageDTO>> getConversations(Authentication auth) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(chatService.getActiveConversations());
    }

    /**
     * GET /api/chat/history/{email} — returns full message history.
     * Admins can view any conversation; customers can only view their own.
     */
    @GetMapping("/api/chat/history/{email}")
    public ResponseEntity<List<ChatMessageDTO>> getHistory(
            @PathVariable String email, Authentication auth) {
        String currentUser = auth.getName();
        boolean isAdmin = hasRole(auth, "ROLE_ADMIN");

        if (!isAdmin && !currentUser.equals(email)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(chatService.getConversation(email));
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }
}
