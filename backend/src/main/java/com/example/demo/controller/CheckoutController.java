package com.example.demo.controller;

import com.example.demo.dto.CheckoutRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutController.class);
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping("/process")
    @Transactional
    public ResponseEntity<?> processCheckout(@RequestBody CheckoutRequest request) {
        User user = getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Your cart is empty."));
        }

        // *** STOCK VALIDATION: Check if all products have sufficient stock ***
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() == null || product.getStock() < cartItem.getQuantity()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Insufficient stock for: " + product.getName(),
                    "product", product.getName(),
                    "requested", cartItem.getQuantity(),
                    "available", product.getStock() != null ? product.getStock() : 0,
                    "message", product.getStock() <= 0 ? "Product is not in stock" : "Not enough pieces available"
                ));
            }
        }

        // 1. Save Address
        Address address = Address.builder()
            .user(user)
            .fullName(request.getFullName())
            .street(request.getStreet())
            .city(request.getCity())
            .state(request.getState())
            .zipCode(request.getZipCode())
            .build();
        address = addressRepository.save(address);

        // 2. Calculate securely
        double total = cartItems.stream().mapToDouble(c -> c.getProduct().getPrice() * c.getQuantity()).sum();

        // 3. Create Order
        Order orderEntity = Order.builder()
            .user(user)
            .address(address)
            .totalAmount(total)
            .status("PAID")
            .createdAt(LocalDateTime.now())
            .build();
        final Order savedOrder = orderRepository.save(orderEntity);

        // 4. Transform Cart Items to Order Items & UPDATE STOCK
        List<OrderItem> orderItems = cartItems.stream().map(c -> {
            // Decrease product stock by quantity ordered
            Product product = c.getProduct();
            product.setStock(product.getStock() - c.getQuantity());
            productRepository.save(product);

            // Log stock status
            if (product.getStock() <= 0) {
                System.out.println("⚠️ Product OUT OF STOCK: " + product.getName());
            }

            return OrderItem.builder()
                .order(savedOrder)
                .product(product)
                .quantity(c.getQuantity())
                .price(c.getProduct().getPrice())
                .size(c.getSize())
                .color(c.getColor())
                .build();
        }).collect(Collectors.toList());

        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        // 5. Clear the Cart securely
        cartItemRepository.deleteByUserId(user.getId());

        // 6. Send confirmation email
        emailService.sendOrderConfirmation(savedOrder);

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(getCurrentUser().getId()));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(order);
    }

    // ── USER: Cancel their own order (only if PAID) ──────────────────────────
    @PutMapping("/orders/{orderId}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        logger.info("🔴 CANCEL REQUEST received for Order #" + orderId);
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId).orElseThrow();

        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your order."));
        }
        if (!"PAID".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error",
                "Only orders with status PAID can be cancelled. Current status: " + order.getStatus()));
        }

        // *** RESTORE STOCK: Return items back to inventory ***
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
                logger.info("✓ Restored stock for: " + product.getName() + " +" + item.getQuantity() + " (Total: " + product.getStock() + ")");
                System.out.println("✓ Restored stock for: " + product.getName() + " +" + item.getQuantity() + " (Total: " + product.getStock() + ")");
            }
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);
        
        logger.info("📧 Initiating Order Cancellation Email for Order #{}", orderId);
        System.out.println("📧 ABOUT TO SEND CANCELLATION EMAIL...");
        emailService.sendOrderCancelled(order);
        System.out.println("📧 CANCELLATION EMAIL METHOD CALLED!");
        
        return ResponseEntity.ok(Map.of("message", "Order #" + orderId + " has been cancelled. Stock has been restored."));
    }

    // ── ADMIN: All orders ─────────────────────────────────────────────────────
    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderRepository.findAll(
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")));
    }

    // ── ADMIN: Update status + trigger email ──────────────────────────────────
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        logger.info("🔧 ADMIN STATUS UPDATE: Order #{} → {}", orderId, status);
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        Order saved = orderRepository.save(order);

        switch (status) {
            case "SHIPPED" -> {
                logger.info("📧 Triggering SHIPPED email for Order #{}", orderId);
                System.out.println("📧 SHIPPED: Sending email to " + saved.getUser().getEmail());
                emailService.sendOrderShipped(saved);
            }
            case "DELIVERED" -> {
                logger.info("📧 Triggering DELIVERED email for Order #{}", orderId);
                System.out.println("📧 DELIVERED: Sending email to " + saved.getUser().getEmail());
                emailService.sendOrderDelivered(saved);
            }
            case "CANCELLED" -> {
                logger.info("📧 Triggering CANCELLED email for Order #{}", orderId);
                System.out.println("📧 CANCELLED: Sending email to " + saved.getUser().getEmail());
                emailService.sendOrderCancelled(saved);
            }
        }

        return ResponseEntity.ok(saved);
    }
}
