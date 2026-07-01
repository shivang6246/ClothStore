package com.example.demo.repository;

import com.example.demo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** Get all messages for a specific customer conversation, ordered by time. */
    List<ChatMessage> findByConversationEmailOrderByTimestampAsc(String conversationEmail);

    /** Get distinct customer emails that have started a chat (for admin list). */
    @Query("SELECT DISTINCT m.conversationEmail FROM ChatMessage m ORDER BY m.conversationEmail")
    List<String> findDistinctConversationEmails();

    /** Get the latest message per conversation for admin overview. */
    @Query("SELECT m FROM ChatMessage m WHERE m.id IN " +
           "(SELECT MAX(m2.id) FROM ChatMessage m2 GROUP BY m2.conversationEmail) " +
           "ORDER BY m.timestamp DESC")
    List<ChatMessage> findLatestMessagePerConversation();

    void deleteByConversationEmail(String conversationEmail);
}
