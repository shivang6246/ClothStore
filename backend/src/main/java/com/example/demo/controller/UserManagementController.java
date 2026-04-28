package com.example.demo.controller;
import com.example.demo.entity.Order;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ReviewRepository reviewRepository;
    private final AddressRepository addressRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final OtpTokenRepository otpTokenRepository;

    @GetMapping
    @Cacheable(value = "usersList")
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream().map(u -> {
            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(u.getId());
            long orderCount = orders.size();
            double totalSpent = orders.stream()
                .filter(o -> o.getStatus() != null && !o.getStatus().equals("CANCELLED"))
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();

            Map<String, Object> row = new HashMap<>();
            row.put("id", u.getId());
            row.put("fullName", u.getFullName() != null ? u.getFullName() : "");
            row.put("email", u.getEmail() != null ? u.getEmail() : "");
            row.put("role", u.getRole() != null ? u.getRole() : "USER");
            row.put("orderCount", orderCount);
            row.put("totalSpent", Math.round(totalSpent * 100.0) / 100.0);
            return row;
        }).collect(Collectors.toList());
    }

    @PatchMapping("/{id}/role")
    @Transactional
    @CacheEvict(value = "usersList", allEntries = true)
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestParam("role") String role) {
        return userRepository.findById(id)
            .map(u -> {
                u.setRole(role.toUpperCase());
                User saved = userRepository.save(u);
                return ResponseEntity.ok(Map.of(
                    "message", "Role updated to " + role.toUpperCase(),
                    "newRole", saved.getRole()
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    @CacheEvict(value = "usersList", allEntries = true)
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            // Manual cascading delete to prevent FK violations
            String email = user.getEmail();
            
            // 1. Delete transient data
            otpTokenRepository.deleteByEmail(email);
            chatMessageRepository.deleteByConversationEmail(email);
            
            // 2. Delete user-related collections
            cartItemRepository.deleteByUserId(id);
            wishlistItemRepository.deleteByUserId(id);
            reviewRepository.deleteByUserId(id);
            
            // 3. Delete orders (and their items via cascade)
            List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(id);
            orderRepository.deleteAll(userOrders);
            
            // 4. Delete addresses
            addressRepository.deleteByUserId(id);
            
            // 5. Finally delete the user
            userRepository.delete(user);
            
            return ResponseEntity.ok(Map.of("message", "User and all related data deleted successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }
}
