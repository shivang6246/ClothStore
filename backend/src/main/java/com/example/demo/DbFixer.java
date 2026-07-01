package com.example.demo;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(name = "app.db.fixer.enabled", havingValue = "true")
public class DbFixer implements CommandLineRunner {

    private final ProductRepository productRepo;

    public DbFixer(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Per-product name → unique, verified image URL
        Map<String, String> imgMap = new LinkedHashMap<>();
        imgMap.put("classic white tee",       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80");
        imgMap.put("oxford button-down shirt", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80");
        imgMap.put("knitted polo shirt",       "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=600&q=80");
        imgMap.put("henley long sleeve",       "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80");
        imgMap.put("denim jacket",             "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=600&q=80");
        imgMap.put("bomber jacket",            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80");
        imgMap.put("wool overcoat",            "https://images.pexels.com/photos/35004921/pexels-photo-35004921.jpeg?auto=compress&cs=tinysrgb&w=600");
        imgMap.put("slim fit chinos",          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80");
        imgMap.put("tailored trousers",        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80");
        imgMap.put("suede chelsea boots",      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80");
        imgMap.put("trench coat",              "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80");
        imgMap.put("puffer jacket",            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80");
        imgMap.put("shearling coat",           "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=600&q=80");
        imgMap.put("navy slim blazer",         "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80");
        imgMap.put("linen blazer",             "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80");
        imgMap.put("check blazer",             "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80");
        imgMap.put("slip midi dress",          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80");
        imgMap.put("wrap maxi dress",          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80");
        imgMap.put("linen co-ord set",         "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80");
        imgMap.put("knit lounge set",          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80");

        List<Product> products = productRepo.findAll();
        Set<String> existingNames = products.stream()
                .map(Product::getName)
                .filter(name -> name != null && !name.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        for (Product p : products) {
            String nameLower = p.getName() != null ? p.getName().toLowerCase() : "";
            String url = imgMap.get(nameLower);
            if (url != null) {
                p.setImageUrl(url);
                p.setMultipleImages(List.of(url));
                productRepo.save(p);
            }
        }

        // Upsert new products that may not exist yet (checked by name)
        upsert(existingNames, "Trench Coat",      "Outerwear", "Classic double-breasted trench coat with belt and epaulettes.",      215.00, imgMap.get("trench coat"),       List.of("S","M","L","XL"),       List.of("Beige","Black","Navy"));
        upsert(existingNames, "Puffer Jacket",    "Outerwear", "Lightweight down-fill puffer jacket with a packable design.",       135.00, imgMap.get("puffer jacket"),     List.of("S","M","L","XL","XXL"), List.of("Olive","Black","Navy"));
        upsert(existingNames, "Shearling Coat",   "Outerwear", "Genuine shearling coat with suede exterior and plush wool lining.", 380.00, imgMap.get("shearling coat"),    List.of("M","L","XL"),           List.of("Camel","Ivory"));
        upsert(existingNames, "Navy Slim Blazer", "Blazers",   "Slim-cut two-button blazer in a fine wool blend.",                  175.00, imgMap.get("navy slim blazer"),  List.of("S","M","L","XL"),       List.of("Navy","Charcoal"));
        upsert(existingNames, "Linen Blazer",     "Blazers",   "Unstructured linen blazer for a relaxed, sophisticated look.",      145.00, imgMap.get("linen blazer"),      List.of("S","M","L","XL"),       List.of("Ecru","Sage","White"));
        upsert(existingNames, "Check Blazer",     "Blazers",   "Heritage glen-check blazer with notch lapels and patch pockets.",   190.00, imgMap.get("check blazer"),      List.of("S","M","L","XL"),       List.of("Grey","Brown"));
        upsert(existingNames, "Slip Midi Dress",  "Dresses",   "Bias-cut satin slip dress with adjustable straps.",                 110.00, imgMap.get("slip midi dress"),   List.of("XS","S","M","L"),       List.of("Black","Champagne","Dusty Rose"));
        upsert(existingNames, "Wrap Maxi Dress",  "Dresses",   "Fluid wrap-front maxi dress with a flattering V-neckline.",         89.00,  imgMap.get("wrap maxi dress"),   List.of("XS","S","M","L","XL"),  List.of("Floral","Navy","Terracotta"));
        upsert(existingNames, "Linen Co-ord Set", "Sets",      "Matching cropped top and wide-leg trouser set in breathable linen.",125.00, imgMap.get("linen co-ord set"),  List.of("XS","S","M","L"),       List.of("White","Sand","Sage"));
        upsert(existingNames, "Knit Lounge Set",  "Sets",      "Soft-knit relaxed top and jogger set.",                             98.00,  imgMap.get("knit lounge set"),   List.of("S","M","L","XL"),       List.of("Cream","Charcoal","Dusty Lilac"));

        System.out.println("====== DB IMAGES UPDATED (per-product unique URLs) ======");
    }

    private void upsert(Set<String> existingNames, String name, String category, String description, double price,
                        String imageUrl, List<String> sizes, List<String> colors) {
        if (!existingNames.contains(name.toLowerCase())) {
            Product p = new Product();
            p.setName(name);
            p.setCategory(category);
            p.setDescription(description);
            p.setPrice(price);
            p.setImageUrl(imageUrl);
            p.setMultipleImages(List.of(imageUrl));
            p.setSizes(sizes);
            p.setColors(colors);
            p.setStock(50);
            productRepo.save(p);
            existingNames.add(name.toLowerCase());
            System.out.println("✓ Inserted: " + name);
        }
    }
}
