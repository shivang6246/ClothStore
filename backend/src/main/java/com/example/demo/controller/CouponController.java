package com.example.demo.controller;

import com.example.demo.entity.Coupon;
import com.example.demo.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@RestController
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    // ── USER: Validate a coupon code ──────────────────────────────────────────
    @GetMapping("/api/coupons/validate")
    public ResponseEntity<?> validate(@RequestParam String code, @RequestParam double total) {
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid coupon code."));
        }
        Coupon c = opt.get();
        if (!Boolean.TRUE.equals(c.getActive())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This coupon is no longer active."));
        }
        if (c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This coupon has expired."));
        }
        if (c.getMinOrderAmount() != null && total < c.getMinOrderAmount()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                "Minimum order amount of ₹" + c.getMinOrderAmount().intValue() + " required."));
        }
        if (c.getMaxUses() != null && c.getMaxUses() > 0 && c.getUsedCount() >= c.getMaxUses()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Coupon usage limit reached."));
        }

        double discount;
        if ("PERCENTAGE".equals(c.getDiscountType())) {
            discount = Math.min(total, total * c.getDiscountValue() / 100.0);
        } else {
            discount = Math.min(total, c.getDiscountValue());
        }

        return ResponseEntity.ok(Map.of(
            "code", c.getCode(),
            "discountType", c.getDiscountType(),
            "discountValue", c.getDiscountValue(),
            "discount", Math.round(discount * 100.0) / 100.0,
            "description", c.getDescription() != null ? c.getDescription() : ""
        ));
    }

    // ── USER: Apply (increment usedCount) — called when order is placed ──────
    @PostMapping("/api/coupons/apply")
    @CacheEvict(value = "couponsList", allEntries = true)
    public ResponseEntity<?> apply(@RequestParam String code) {
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isPresent()) {
            Coupon c = opt.get();
            c.setUsedCount((c.getUsedCount() == null ? 0 : c.getUsedCount()) + 1);
            couponRepository.save(c);
        }
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // ── ADMIN: List all coupons ───────────────────────────────────────────────
    @GetMapping("/api/admin/coupons")
    @Cacheable(value = "couponsList")
    public List<Coupon> listAll() {
        return couponRepository.findAll();
    }

    // ── ADMIN: Create coupon ──────────────────────────────────────────────────
    @PostMapping("/api/admin/coupons")
    @CacheEvict(value = "couponsList", allEntries = true)
    public ResponseEntity<?> create(@RequestBody Coupon coupon) {
        if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Coupon code already exists."));
        }
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        if (coupon.getUsedCount() == null) coupon.setUsedCount(0);
        if (coupon.getActive() == null) coupon.setActive(true);
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    // ── ADMIN: Update coupon ──────────────────────────────────────────────────
    @PutMapping("/api/admin/coupons/{id}")
    @CacheEvict(value = "couponsList", allEntries = true)
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Coupon updated) {
        return couponRepository.findById(id)
            .map(c -> {
                c.setCode(updated.getCode().toUpperCase().trim());
                c.setDiscountType(updated.getDiscountType());
                c.setDiscountValue(updated.getDiscountValue());
                c.setMinOrderAmount(updated.getMinOrderAmount());
                c.setMaxUses(updated.getMaxUses());
                c.setExpiryDate(updated.getExpiryDate());
                c.setDescription(updated.getDescription());
                c.setActive(updated.getActive());
                return ResponseEntity.ok(couponRepository.save(c));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: Toggle active ──────────────────────────────────────────────────
    @PatchMapping("/api/admin/coupons/{id}/toggle")
    @CacheEvict(value = "couponsList", allEntries = true)
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return couponRepository.findById(id)
            .map(c -> {
                c.setActive(!Boolean.TRUE.equals(c.getActive()));
                return ResponseEntity.ok(couponRepository.save(c));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: Delete coupon ──────────────────────────────────────────────────
    @DeleteMapping("/api/admin/coupons/{id}")
    @CacheEvict(value = "couponsList", allEntries = true)
    public ResponseEntity<?> delete(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}
