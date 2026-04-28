package com.example.demo.service;

import com.example.demo.dto.AuthResponse;
import com.example.demo.entity.OtpToken;
import com.example.demo.entity.User;
import com.example.demo.repository.OtpTokenRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;

    @Transactional
    public void generateAndSendOtp(String email) {
        // For OTP login: Find user or create if not exists (passwordless login)
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            String role = email.equalsIgnoreCase("admin@example.com") ? "ADMIN" : "CUSTOMER";
            User newUser = User.builder().email(email).role(role).build();
            userRepository.save(newUser);
        }

        sendOtpEmail(email, "Vogue Apparel Login OTP", "Your OTP is: ");
    }

    // For SIGNUP - does NOT create a user prematurely
    @Transactional
    public void generateAndSendOtpForSignup(String email) {
        sendOtpEmail(email, "Vogue Apparel - Verify Your Email", "Your signup verification code is: ");
    }

    // Saves OTP to DB (called from within @Transactional methods above)
    private String persistOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpTokenRepository.deleteByEmail(email);
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();
        otpTokenRepository.save(otpToken);
        System.out.println("=========================================");
        System.out.println(">>> OTP for " + email + ": " + otp + " <<<");
        System.out.println("=========================================");
        return otp;
    }

    private void sendOtpEmail(String email, String subject, String prefix) {
        String otp = persistOtp(email);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject(subject);
            message.setText(prefix + otp + ". It is valid for 10 minutes.");
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + email);
        } catch (Exception e) {
            // Email failed but OTP is already saved — don't block the flow
            // The OTP is visible in the console above for development use
            System.err.println("WARNING: Email delivery failed for " + email + ". Error: " + e.getMessage());
            System.err.println("The OTP above is still valid — user can proceed with verification.");
        }
    }


    @Transactional
    public void generateAndSendOtpForReset(String email) {
        // Find user, throw error if not exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email. Please register first.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Remove old OTPs for this email to prevent multiple valid OTPs
        otpTokenRepository.deleteByEmail(email);

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5)) // 5 minutes validity
                .build();
        otpTokenRepository.save(otpToken);

        // Simulated Send OTP via email (Console for now)
        System.out.println("=========================================");
        System.out.println("Generated Password Reset OTP for " + email + ": " + otp);
        System.out.println("=========================================");
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Vogue Apparel Password Reset Code");
            message.setText("Your password reset code is: " + otp + ". It is valid for 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send reset email to " + email + ": " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailAndOtp(email, otp);
        
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        // OTP is valid
        otpTokenRepository.deleteByEmail(email); // consume OTP
        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", user.getRole());
        String token = jwtService.generateToken(claims, email);
        
        return AuthResponse.builder()
                .token(token)
                .message("Authentication successful")
                .role(user.getRole())
                .build();
    }
}
