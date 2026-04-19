package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow();
    }

    /** GET /api/reviews/{productId} — public: returns reviews + stats */
    @GetMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> getReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewRepo.findByProductIdOrderByCreatedAtDesc(productId);
        Double avg = reviewRepo.findAverageRatingByProductId(productId);
        Long total = reviewRepo.countByProductId(productId);

        // Rating distribution: {5: 12, 4: 5, ...}
        List<Object[]> dist = reviewRepo.findRatingDistributionByProductId(productId);
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) distribution.put(i, 0L);
        for (Object[] row : dist) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("reviews", reviews);
        result.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        result.put("totalReviews", total);
        result.put("distribution", distribution);
        return ResponseEntity.ok(result);
    }

    /** POST /api/reviews/{productId} — authenticated: submit or update review */
    @PostMapping("/{productId}")
    public ResponseEntity<Review> submitReview(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        Product product = productRepo.findById(productId).orElseThrow();

        Integer rating = (Integer) body.get("rating");
        String comment = (String) body.get("comment");

        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }

        // Upsert: one review per user per product
        Review review = reviewRepo.findByProductIdAndUserId(productId, user.getId())
                .orElse(Review.builder().product(product).user(user).build());

        review.setRating(rating);
        review.setComment(comment != null ? comment.trim() : "");
        review.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(reviewRepo.save(review));
    }

    /** DELETE /api/reviews/{productId} — user deletes their own review */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId) {
        User user = getCurrentUser();
        reviewRepo.findByProductIdAndUserId(productId, user.getId())
                .ifPresent(reviewRepo::delete);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/reviews/{productId}/mine — check if current user already reviewed */
    @GetMapping("/{productId}/mine")
    public ResponseEntity<Review> getMyReview(@PathVariable Long productId) {
        User user = getCurrentUser();
        return reviewRepo.findByProductIdAndUserId(productId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
