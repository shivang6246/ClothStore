package com.example.demo.controller;

import com.example.demo.entity.Order;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@RequiredArgsConstructor
public class UserManagementController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> result = users.stream().map(u -> {
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

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestParam String role) {
        return userRepository.findById(id)
            .map(u -> {
                u.setRole(role.toUpperCase());
                userRepository.save(u);
                return ResponseEntity.ok(Map.of("message", "Role updated to " + role.toUpperCase()));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }
}
