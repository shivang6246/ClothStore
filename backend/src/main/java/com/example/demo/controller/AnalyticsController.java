package com.example.demo.controller;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:5173,http://localhost:5174,http://localhost:5175")
public class AnalyticsController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> validOrders = allOrders.stream()
            .filter(o -> !"CANCELLED".equals(o.getStatus()))
            .collect(Collectors.toList());

        // ── Summary stats ──────────────────────────────────────────────────────
        double totalRevenue = validOrders.stream()
            .mapToDouble(o -> o.getTotalAmount() == null ? 0 : o.getTotalAmount())
            .sum();
        long totalOrders = validOrders.size();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // ── Orders by status ───────────────────────────────────────────────────
        Map<String, Long> byStatus = allOrders.stream()
            .collect(Collectors.groupingBy(o -> o.getStatus() != null ? o.getStatus() : "UNKNOWN", Collectors.counting()));

        // ── Revenue last 14 days ───────────────────────────────────────────────
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
        Map<String, Double> revenueByDay = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 13; i >= 0; i--) {
            revenueByDay.put(today.minusDays(i).format(fmt), 0.0);
        }
        for (Order o : validOrders) {
            if (o.getCreatedAt() != null) {
                LocalDate date = o.getCreatedAt().toLocalDate();
                String key = date.format(fmt);
                if (revenueByDay.containsKey(key)) {
                    revenueByDay.merge(key, o.getTotalAmount() == null ? 0 : o.getTotalAmount(), Double::sum);
                }
            }
        }

        // ── Orders last 14 days ────────────────────────────────────────────────
        Map<String, Long> ordersByDay = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            ordersByDay.put(today.minusDays(i).format(fmt), 0L);
        }
        for (Order o : validOrders) {
            if (o.getCreatedAt() != null) {
                String key = o.getCreatedAt().toLocalDate().format(fmt);
                if (ordersByDay.containsKey(key)) {
                    ordersByDay.merge(key, 1L, Long::sum);
                }
            }
        }

        // ── Top 5 products by quantity sold ───────────────────────────────────
        Map<String, Long> productSales = new HashMap<>();
        Map<String, Double> productRevenue = new HashMap<>();
        for (Order o : validOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null) {
                        String name = item.getProduct().getName();
                        productSales.merge(name, (long)(item.getQuantity() == null ? 0 : item.getQuantity()), Long::sum);
                        productRevenue.merge(name, (item.getPrice() == null ? 0 : item.getPrice()) * (item.getQuantity() == null ? 0 : item.getQuantity()), Double::sum);
                    }
                }
            }
        }
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("name", e.getKey());
                m.put("unitsSold", e.getValue());
                m.put("revenue", Math.round(productRevenue.getOrDefault(e.getKey(), 0.0) * 100.0) / 100.0);
                return m;
            })
            .collect(Collectors.toList());

        // ── Category breakdown ─────────────────────────────────────────────────
        Map<String, Double> categoryRevenue = new HashMap<>();
        for (Order o : validOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                        String cat = item.getProduct().getCategory();
                        categoryRevenue.merge(cat,
                            (item.getPrice() == null ? 0 : item.getPrice()) * (item.getQuantity() == null ? 0 : item.getQuantity()),
                            Double::sum);
                    }
                }
            }
        }

        // ── Assemble response ──────────────────────────────────────────────────
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        response.put("totalOrders", totalOrders);
        response.put("totalUsers", totalUsers);
        response.put("totalProducts", totalProducts);
        response.put("avgOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);
        response.put("ordersByStatus", byStatus);
        response.put("revenueByDay", revenueByDay);
        response.put("ordersByDay", ordersByDay);
        response.put("topProducts", topProducts);
        response.put("categoryRevenue", categoryRevenue);

        return ResponseEntity.ok(response);
    }
}
