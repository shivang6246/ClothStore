package com.example.demo.service;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public void sendOrderConfirmation(Order order) {
        try {
            String to = order.getUser().getEmail();
            logger.info("📧 Attempting to send order confirmation email to: {} for Order #{}...", to, order.getId());
            String subject = "Order Confirmed — #" + order.getId() + " | VOGUE";
            String body = buildOrderEmail(order, "Your Order is Confirmed!", "#3b82f6",
                "Thank you for shopping with VOGUE. We've received your order and it's being processed.",
                "We'll notify you when your order is shipped.");
            send(to, subject, body);
            logger.info("✓ Order confirmation email sent to: {}", to);
            System.out.println("============================================");
            System.out.println("✓ CONFIRMATION EMAIL SENT TO: " + to);
            System.out.println("============================================");
        } catch (Exception e) {
            logger.error("❌ Email error (order confirm) for {}: {}", 
                order.getUser() != null ? order.getUser().getEmail() : "unknown", e.getMessage(), e);
            System.err.println("============================================");
            System.err.println("❌ CONFIRMATION EMAIL FAILED!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("============================================");
        }
    }

    public void sendOrderShipped(Order order) {
        try {
            String to = order.getUser().getEmail();
            logger.info("📧 Attempting to send shipped email to: {} for Order #{}...", to, order.getId());
            String subject = "Your Order is on the Way — #" + order.getId() + " | VOGUE";
            String body = buildOrderEmail(order, "Your Order Has Shipped!", "#8b5cf6",
                "Great news! Your order is on its way to you.",
                "Estimated delivery: 3–5 business days.");
            send(to, subject, body);
            logger.info("✓ Order shipped email sent to: {}", to);
            System.out.println("============================================");
            System.out.println("✓ SHIPPED EMAIL SENT TO: " + to);
            System.out.println("============================================");
        } catch (Exception e) {
            logger.error("❌ Email error (order shipped) for {}: {}", 
                order.getUser() != null ? order.getUser().getEmail() : "unknown", e.getMessage(), e);
            System.err.println("============================================");
            System.err.println("❌ SHIPPED EMAIL FAILED!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("============================================");
        }
    }

    public void sendOrderDelivered(Order order) {
        try {
            String to = order.getUser().getEmail();
            logger.info("📧 Attempting to send delivery email to: {} for Order #{}...", to, order.getId());
            String subject = "Order Delivered — #" + order.getId() + " | VOGUE";
            String body = buildOrderEmail(order, "Order Delivered Successfully!", "#22c55e",
                "Your order has been delivered. We hope you love your new pieces.",
                "If you have any issues, please contact our support team.");
            send(to, subject, body);
            logger.info("✓ Order delivered email sent to: {}", to);
            System.out.println("============================================");
            System.out.println("✓ DELIVERY EMAIL SENT TO: " + to);
            System.out.println("============================================");
        } catch (Exception e) {
            logger.error("❌ Email error (order delivered) for {}: {}", 
                order.getUser() != null ? order.getUser().getEmail() : "unknown", e.getMessage(), e);
            System.err.println("============================================");
            System.err.println("❌ DELIVERY EMAIL FAILED!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("============================================");
        }
    }

    public void sendOrderCancelled(Order order) {
        try {
            String to = order.getUser().getEmail();
            logger.info("📧 Attempting to send cancellation email to: {} for Order #{}...", to, order.getId());
            String subject = "Order Cancelled — #" + order.getId() + " | VOGUE";
            String body = buildOrderEmail(order, "Your Order Has Been Cancelled", "#ef4444",
                "Your order has been successfully cancelled as requested.",
                "If you did not request this cancellation, please contact our support immediately.");
            send(to, subject, body);
            logger.info("✓ Order cancellation email sent to: {}", to);
            System.out.println("============================================");
            System.out.println("✓ CANCELLATION EMAIL SENT TO: " + to);
            System.out.println("============================================");
        } catch (Exception e) {
            logger.error("❌ Email error (order cancel) for {}: {}", 
                order.getUser() != null ? order.getUser().getEmail() : "unknown", e.getMessage(), e);
            System.err.println("============================================");
            System.err.println("❌ CANCELLATION EMAIL FAILED!");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.err.println("============================================");
        }
    }

    private void send(String to, String subject, String html) throws Exception {
        logger.debug("📧 Creating email - To: {}, Subject: {}", to, subject);
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setFrom("ultronthor037@gmail.com");
        helper.setText(html, true);
        mailSender.send(msg);
        logger.debug("✓ Email sent successfully to: {}", to);
    }

    private String buildOrderEmail(Order order, String headline, String accentColor, String intro, String outro) {
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String name = item.getProduct() != null ? item.getProduct().getName() : "Product";
                double itemTotal = (item.getPrice() == null ? 0 : item.getPrice()) * (item.getQuantity() == null ? 0 : item.getQuantity());
                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#f0ede6;font-size:14px;">%s</td>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;font-size:13px;text-align:center;">Qty: %d</td>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#c9a96e;font-size:14px;font-weight:600;text-align:right;">&#8377;%.0f</td>
                    </tr>
                """, name, item.getQuantity() == null ? 0 : item.getQuantity(), itemTotal));
            }
        }

        String address = "";
        if (order.getAddress() != null) {
            address = String.format("%s, %s, %s %s",
                order.getAddress().getStreet(),
                order.getAddress().getCity(),
                order.getAddress().getState(),
                order.getAddress().getZipCode());
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <div style="max-width:580px;margin:0 auto;background:#0a0a0a;">
                <!-- Header -->
                <div style="background:#080808;border-bottom:1px solid #1e1e1e;padding:32px 40px;text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:28px;font-weight:300;letter-spacing:14px;color:#f0ede6;">VOGUE</div>
                  <div style="font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;margin-top:4px;">Luxury Menswear</div>
                </div>
                <!-- Accent Bar -->
                <div style="height:3px;background:linear-gradient(90deg,%s,transparent);"></div>
                <!-- Body -->
                <div style="padding:40px;">
                  <h1 style="font-family:Georgia,serif;font-weight:300;font-size:26px;color:#f0ede6;margin:0 0 8px;">%s</h1>
                  <p style="color:#888;font-size:13px;margin:0 0 28px;line-height:1.8;">%s</p>
                  <!-- Order Meta -->
                  <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;display:flex;gap:40px;">
                    <div>
                      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:4px;">Order</div>
                      <div style="font-size:18px;color:#c9a96e;font-family:Georgia,serif;">#%d</div>
                    </div>
                    <div>
                      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:4px;">Total</div>
                      <div style="font-size:18px;color:#f0ede6;font-weight:600;">&#8377;%.0f</div>
                    </div>
                    <div>
                      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:4px;">Status</div>
                      <div style="font-size:13px;color:%s;font-weight:600;text-transform:uppercase;letter-spacing:1px;">%s</div>
                    </div>
                  </div>
                  <!-- Items -->
                  <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:12px;">Items Ordered</div>
                  <table style="width:100%%;border-collapse:collapse;margin-bottom:24px;">%s</table>
                  <!-- Address -->
                  %s
                  <!-- Outro -->
                  <p style="color:#666;font-size:12px;line-height:1.8;margin:24px 0 0;">%s</p>
                </div>
                <!-- Footer -->
                <div style="background:#080808;border-top:1px solid #1e1e1e;padding:24px 40px;text-align:center;">
                  <div style="font-size:10px;color:#333;letter-spacing:2px;">© 2026 VOGUE INDIA · ALL RIGHTS RESERVED</div>
                </div>
              </div>
            </body>
            </html>
            """,
            accentColor, headline, intro,
            order.getId(), order.getTotalAmount() == null ? 0 : order.getTotalAmount(),
            accentColor, order.getStatus(),
            itemsHtml.toString(),
            address.isEmpty() ? "" : String.format(
                "<div style='background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:16px;margin-bottom:24px;'>" +
                "<div style='font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:6px;'>Deliver To</div>" +
                "<div style='color:#888;font-size:13px;'>%s</div></div>", address),
            outro
        );
    }
}
