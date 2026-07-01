package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.entity.WishlistItem;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<WishlistItem>> getWishlist() {
        return ResponseEntity.ok(wishlistRepository.findByUserId(getCurrentUser().getId()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItem> toggleWishlist(@PathVariable Long productId) {
        User user = getCurrentUser();
        return wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
            .map(item -> {
                wishlistRepository.delete(item);
                return ResponseEntity.ok((WishlistItem) null); // Removed -> return null to indicate removal
            }).orElseGet(() -> {
                Product product = productRepository.findById(productId).orElseThrow();
                WishlistItem newItem = WishlistItem.builder().user(user).product(product).build();
                return ResponseEntity.ok(wishlistRepository.save(newItem));
            });
    }
}
