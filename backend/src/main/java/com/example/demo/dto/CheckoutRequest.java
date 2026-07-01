package com.example.demo.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String fullName;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String paymentToken; // Mock Stripe/Razorpay token
}
