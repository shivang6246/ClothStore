package com.example.demo.service;

import com.example.demo.dto.ChatMessageDTO;
import com.example.demo.entity.ChatMessage;
import com.example.demo.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * Save a chat message and return its DTO representation.
     */
    public ChatMessageDTO saveMessage(ChatMessageDTO dto) {
        ChatMessage message = ChatMessage.builder()
                .senderEmail(dto.getSenderEmail())
                .senderName(dto.getSenderName())
                .conversationEmail(dto.getConversationEmail())
                .content(dto.getContent())
                .timestamp(LocalDateTime.now())
                .fromAdmin(dto.isFromAdmin())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        return toDTO(saved);
    }

    /**
     * Get all messages for a specific customer conversation.
     */
    public List<ChatMessageDTO> getConversation(String conversationEmail) {
        return chatMessageRepository
                .findByConversationEmailOrderByTimestampAsc(conversationEmail)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get the latest message per conversation for the admin overview list.
     */
    public List<ChatMessageDTO> getActiveConversations() {
        return chatMessageRepository
                .findLatestMessagePerConversation()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ChatMessageDTO toDTO(ChatMessage msg) {
        return ChatMessageDTO.builder()
                .id(msg.getId())
                .senderEmail(msg.getSenderEmail())
                .senderName(msg.getSenderName())
                .conversationEmail(msg.getConversationEmail())
                .content(msg.getContent())
                .timestamp(msg.getTimestamp())
                .fromAdmin(msg.isFromAdmin())
                .build();
    }
}
