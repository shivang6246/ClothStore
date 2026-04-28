package com.example.demo.controller;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.VerifyRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.OtpToken;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.service.JwtService;
import com.example.demo.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpTokenRepository otpTokenRepository;

    @Value("${admin.email:admin@example.com}")
    private String adminEmail;

    // Check if email is already registered (for real-time signup validation)
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // Step 1: Validate signup details and send OTP to email
    @PostMapping("/register/send-otp")
    public ResponseEntity<?> registerSendOtp(@RequestBody RegisterRequest request) {
        // Validate email not taken
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "This email is already registered. Please sign in instead.",
                "code", "EMAIL_EXISTS"
            ));
        }

        // Validate fields
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name is required."));
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters."));
        }

        // Send OTP to the email
        try {
            otpService.generateAndSendOtpForSignup(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "Verification code sent to " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send verification email. Please try again."));
        }
    }

    // Step 2: Verify OTP and complete registration
    @PostMapping("/register/verify")
    @Transactional
    public ResponseEntity<?> registerVerify(@RequestBody RegisterRequest request) {
        // Validate OTP
        if (request.getOtp() == null || request.getOtp().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code is required."));
        }

        // Check OTP validity
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtp(request.getEmail(), request.getOtp());
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired verification code. Please try again."));
        }

        // OTP valid — consume it
        otpTokenRepository.deleteByEmail(request.getEmail());

        // Check if email already has a real account (not a ghost/passwordless OTP user)
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent() && existingUser.get().getPassword() != null) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "This email is already registered. Please sign in instead.",
                "code", "EMAIL_EXISTS"
            ));
        }

        // Create the user (or upgrade ghost user if it exists without a password)
        String role = request.getEmail().equalsIgnoreCase(adminEmail) ? "ADMIN" : "CUSTOMER";

        User user = existingUser.orElse(User.builder()
            .email(request.getEmail())
            .role(role)
            .build());

        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        userRepository.save(user);

        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", role);
        String token = jwtService.generateToken(claims, user.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
            .token(token)
            .role(role)
            .fullName(user.getFullName())
            .email(user.getEmail())
            .build());

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "No account found with this email. Please register first."));
        }

        User user = userOpt.get();

        if (user.getPassword() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No password set for this account. Please use OTP login or register again."));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect password. Please try again."));
        }

        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", user.getRole());
        String token = jwtService.generateToken(claims, user.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
            .token(token)
            .role(user.getRole())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .build());
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send OTP. Please try again later."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyRequest request) {
        try {
            AuthResponse response = otpService.verifyOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // Step 1: Send OTP for Password Reset
    @PostMapping("/reset-password/send-otp")
    public ResponseEntity<?> resetPasswordSendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            otpService.generateAndSendOtpForReset(email);
            return ResponseEntity.ok(Map.of("message", "Password reset code sent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // Step 2: Verify OTP and save new password
    @PostMapping("/reset-password/verify")
    @Transactional
    public ResponseEntity<?> resetPasswordVerify(@RequestBody com.example.demo.dto.ResetPasswordRequest request) {
        // Validate OTP
        if (request.getOtp() == null || request.getOtp().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code is required."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters."));
        }

        // Check OTP validity
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtp(request.getEmail(), request.getOtp());
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired verification code. Please try again."));
        }

        // OTP valid — consume it
        otpTokenRepository.deleteByEmail(request.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }
}
