package com.example.demo.entity;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_user_id", columnList = "user_id"),
    @Index(name = "idx_cart_user_product", columnList = "user_id, product_id, size, color")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;
    
    private Integer quantity;
    private String size;
    private String color;
}
