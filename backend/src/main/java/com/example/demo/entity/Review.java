package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_product_id", columnList = "product_id"),
    @Index(name = "idx_review_user_id", columnList = "user_id"),
    @Index(name = "idx_review_product_user", columnList = "product_id, user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "sizes", "colors", "multipleImages", "description"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "role", "email"})
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1–5

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt;
}
