package com.example.demo.util;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbImageFixer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Value("${app.db.fixer.enabled:true}")
    private boolean enabled;

    // ── 19 UNIQUE images — every single URL is different, zero repeats ──
    private static final Map<String, String> PRODUCT_IMAGES = Map.ofEntries(
        Map.entry("Classic White Tee", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Denim Jacket",      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Slim Fit Chinos",   "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Bomber Jacket",     "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Oxford Shirt",      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Wool Overcoat",     "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Knitted Polo",      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Tailored Trousers", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Henley Shirt",      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Chelsea Boots",     "https://images.unsplash.com/photo-1638247025967-b4e38f7bf9c4?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Trench Coat",       "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Puffer Jacket",     "https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Shearling Coat",    "https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Navy Blazer",       "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Linen Blazer",      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Slip Dress",        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Wrap Dress",        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Linen Set",         "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"),
        Map.entry("Knit Set",          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop")
    );

    @Override
    @CacheEvict(value = {"products", "productList"}, allEntries = true)
    public void run(String... args) {
        if (!enabled) return;

        log.info("🚀 DB Image Fixer: Assigning unique images to every product...");
        List<Product> products = productRepository.findAll();
        int updatedCount = 0;

        for (Product p : products) {
            String targetImg = PRODUCT_IMAGES.get(p.getName());
            if (targetImg != null) {
                p.setImageUrl(targetImg);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            productRepository.saveAll(products);
            log.info("✅ Success: Updated {} product images with unique stock photos.", updatedCount);
        } else {
            log.info("ℹ️ No images needed updating.");
        }
    }
}
