package com.example.demo.controller;

import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<CartItem>> getCart() {
        return ResponseEntity.ok(cartItemRepository.findByUserId(getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProduct().getId()).orElseThrow();
        
        CartItem item = cartItemRepository.findByUserIdAndProductIdAndSizeAndColor(
                user.getId(), product.getId(), request.getSize(), request.getColor()
        ).orElse(CartItem.builder()
                .user(user)
                .product(product)
                .size(request.getSize())
                .color(request.getColor())
                .quantity(0)
                .build());
                
        item.setQuantity(item.getQuantity() + request.getQuantity());
        return ResponseEntity.ok(cartItemRepository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long id, @RequestBody CartItem request) {
        CartItem item = cartItemRepository.findById(id).orElseThrow();
        if(!item.getUser().getId().equals(getCurrentUser().getId())) return ResponseEntity.status(403).build();
        item.setQuantity(request.getQuantity());
        return ResponseEntity.ok(cartItemRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id) {
        CartItem item = cartItemRepository.findById(id).orElseThrow();
        if(!item.getUser().getId().equals(getCurrentUser().getId())) return ResponseEntity.status(403).build();
        cartItemRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<?> clearCart() {
        cartItemRepository.deleteByUserId(getCurrentUser().getId());
        return ResponseEntity.ok().build();
    }
}
