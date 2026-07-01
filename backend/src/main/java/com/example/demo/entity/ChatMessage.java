package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_conversation", columnList = "conversationEmail"),
    @Index(name = "idx_chat_timestamp", columnList = "timestamp"),
    @Index(name = "idx_chat_convo_timestamp", columnList = "conversationEmail, timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderEmail;

    private String senderName;

    /** The customer email this conversation belongs to (used for grouping). */
    @Column(nullable = false)
    private String conversationEmail;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean fromAdmin;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
