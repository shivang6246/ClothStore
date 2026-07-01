package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String discountType; // PERCENTAGE or FLAT

    private Double discountValue;

    @Column(nullable = true)
    private Double minOrderAmount;

    private Integer maxUses; // 0 = unlimited

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private Boolean active = true;

    @Column(nullable = true)
    private LocalDate expiryDate;

    private String description;
}
