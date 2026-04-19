package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @PostConstruct
    public void initProducts() {
        if (productRepository.count() == 0) {
            productRepository.saveAll(List.of(
                Product.builder().name("Classic White Tee").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("White","Black","Grey")).description("Premium organic cotton crew-neck t-shirt with a relaxed fit. Perfect for layering or wearing on its own.").price(29.99).imageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600").build(),
                Product.builder().name("Denim Jacket").category("Jacket").sizes(Arrays.asList("M","L","XL")).colors(Arrays.asList("Blue","Black")).description("Vintage-wash denim jacket with classic button front closure. A timeless wardrobe essential for every season.").price(89.50).imageUrl("https://images.unsplash.com/photo-1551537482-f209bfc73dd3?w=600").build(),
                Product.builder().name("Slim Fit Chinos").category("Pants").sizes(Arrays.asList("30","32","34","36")).colors(Arrays.asList("Khaki","Navy","Black")).description("Modern slim-fit chinos crafted from stretch cotton twill. Comfortable enough for all-day wear.").price(49.00).imageUrl("https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600").build(),
                Product.builder().name("Bomber Jacket").category("Jacket").sizes(Arrays.asList("S","M","L","XL","XXL")).colors(Arrays.asList("Brown","Green","Black")).description("Lightweight bomber jacket with ribbed cuffs and hem. Water-resistant outer shell for unpredictable weather.").price(120.00).imageUrl("https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=600").build(),
                Product.builder().name("Oxford Button-Down Shirt").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("White","Blue","Pink")).description("Classic oxford cloth button-down with a slightly tapered fit. The foundation of smart-casual dressing.").price(65.00).imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600").build(),
                Product.builder().name("Wool Overcoat").category("Jacket").sizes(Arrays.asList("M","L","XL")).colors(Arrays.asList("Camel","Charcoal","Navy")).description("Double-breasted wool-blend overcoat with peak lapels. Luxurious warmth meets refined tailoring.").price(245.00).imageUrl("https://images.unsplash.com/photo-1544923246-77307dd270b3?w=600").build(),
                Product.builder().name("Knitted Polo Shirt").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Navy","Cream","Olive")).description("Fine-gauge knitted polo with mother-of-pearl buttons. Elevates any casual outfit effortlessly.").price(79.00).imageUrl("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600").build(),
                Product.builder().name("Tailored Trousers").category("Pants").sizes(Arrays.asList("30","32","34","36")).colors(Arrays.asList("Charcoal","Navy","Sand")).description("Sharply tailored trousers with pressed creases and a comfortable mid-rise waist. Boardroom ready.").price(95.00).imageUrl("https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600").build(),
                Product.builder().name("Henley Long Sleeve").category("T-shirt").sizes(Arrays.asList("S","M","L","XL","XXL")).colors(Arrays.asList("Burgundy","Grey","White")).description("Soft-washed cotton henley with a four-button placket. The perfect weekend companion.").price(42.00).imageUrl("https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600").build(),
                Product.builder().name("Suede Chelsea Boots").category("Footwear").sizes(Arrays.asList("8","9","10","11","12")).colors(Arrays.asList("Tan","Black")).description("Premium suede Chelsea boots with elastic side panels and a stacked leather heel. Handcrafted quality.").price(189.00).imageUrl("https://images.unsplash.com/photo-1638247025967-b4e38f7bf9c4?w=600").build(),
                Product.builder().name("Trench Coat").category("Outerwear").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Beige","Black","Navy")).description("Classic double-breasted trench coat with belt and epaulettes. A heritage silhouette reimagined for the modern wardrobe.").price(215.00).imageUrl("https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Puffer Jacket").category("Outerwear").sizes(Arrays.asList("S","M","L","XL","XXL")).colors(Arrays.asList("Olive","Black","Navy")).description("Lightweight down-fill puffer jacket with a packable design. Insulated warmth without the bulk.").price(135.00).imageUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Shearling Coat").category("Outerwear").sizes(Arrays.asList("M","L","XL")).colors(Arrays.asList("Camel","Ivory")).description("Genuine shearling coat with suede exterior and plush wool lining. Ultimate winter luxury.").price(380.00).imageUrl("https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Navy Slim Blazer").category("Blazers").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Navy","Charcoal")).description("Slim-cut two-button blazer in a fine wool blend. Transitions effortlessly from office to evening.").price(175.00).imageUrl("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Linen Blazer").category("Blazers").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Ecru","Sage","White")).description("Unstructured linen blazer for a relaxed, sophisticated look. The ultimate summer suiting piece.").price(145.00).imageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Check Blazer").category("Blazers").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Grey","Brown")).description("Heritage glen-check blazer with notch lapels and patch pockets. A pattern that never goes out of style.").price(190.00).imageUrl("https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Slip Midi Dress").category("Dresses").sizes(Arrays.asList("XS","S","M","L")).colors(Arrays.asList("Black","Champagne","Dusty Rose")).description("Bias-cut satin slip dress with adjustable straps. Effortlessly chic for day or night.").price(110.00).imageUrl("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Wrap Maxi Dress").category("Dresses").sizes(Arrays.asList("XS","S","M","L","XL")).colors(Arrays.asList("Floral","Navy","Terracotta")).description("Fluid wrap-front maxi dress with a flattering V-neckline. Versatile elegance for any occasion.").price(89.00).imageUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Linen Co-ord Set").category("Sets").sizes(Arrays.asList("XS","S","M","L")).colors(Arrays.asList("White","Sand","Sage")).description("Matching cropped top and wide-leg trouser set in breathable linen. The ultimate summer two-piece.").price(125.00).imageUrl("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80").build(),
                Product.builder().name("Knit Lounge Set").category("Sets").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Cream","Charcoal","Dusty Lilac")).description("Soft-knit relaxed top and jogger set. Luxurious comfort that doesn't compromise on style.").price(98.00).imageUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80").build()
            ));
            System.out.println("✓ Inserted 20 seed products into database.");
        }
    }

    public List<Product> getAllProducts(String search, String category, Double minPrice, Double maxPrice, String sort) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sorting = Sort.unsorted();
        if ("price_asc".equals(sort)) {
            sorting = Sort.by("price").ascending();
        } else if ("price_desc".equals(sort)) {
            sorting = Sort.by("price").descending();
        }

        return productRepository.findAll(spec, sorting);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product details) {
        Product existing = getProductById(id);
        if (details.getName() != null) existing.setName(details.getName());
        if (details.getDescription() != null) existing.setDescription(details.getDescription());
        if (details.getPrice() != null) existing.setPrice(details.getPrice());
        if (details.getImageUrl() != null) existing.setImageUrl(details.getImageUrl());
        if (details.getCategory() != null) existing.setCategory(details.getCategory());
        if (details.getSizes() != null) existing.setSizes(details.getSizes());
        if (details.getColors() != null) existing.setColors(details.getColors());
        if (details.getMultipleImages() != null) existing.setMultipleImages(details.getMultipleImages());
        if (details.getStock() != null) existing.setStock(details.getStock());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
