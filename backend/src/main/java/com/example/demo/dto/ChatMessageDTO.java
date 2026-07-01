package com.example.demo.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private String senderEmail;
    private String senderName;
    private String conversationEmail;
    private String content;
    private LocalDateTime timestamp;
    private boolean fromAdmin;
}
