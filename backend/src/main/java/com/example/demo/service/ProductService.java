package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.dto.PageResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    @Value("${app.seed.products.enabled:false}")
    private boolean seedProductsEnabled;

    @PostConstruct
    public void initProducts() {
        if (!seedProductsEnabled) {
            log.info("Product seed is disabled. Skipping initProducts.");
            return;
        }

        try {
            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                Product.builder().name("Classic White Tee").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("White","Black")).description("Premium organic cotton crew-neck t-shirt with a relaxed fit. Perfect for layering.").price(29.99).stock(50).imageUrl("https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Denim Jacket").category("Jacket").sizes(Arrays.asList("M","L","XL")).colors(Arrays.asList("Blue","Black")).description("Vintage-wash denim jacket with classic button front closure. A timeless wardrobe essential.").price(89.50).stock(50).imageUrl("https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Slim Fit Chinos").category("Pants").sizes(Arrays.asList("30","32","34")).colors(Arrays.asList("Khaki","Navy")).description("Modern slim-fit chinos crafted from stretch cotton twill. Comfortable enough for all-day wear.").price(49.00).stock(50).imageUrl("https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Bomber Jacket").category("Jacket").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Olive","Black")).description("Lightweight bomber jacket with ribbed cuffs and hem. Water-resistant outer shell.").price(120.00).stock(50).imageUrl("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Oxford Shirt").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("White","Blue")).description("Classic oxford cloth button-down with a slightly tapered fit. The foundation of smart-casual dressing.").price(65.00).stock(50).imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Wool Overcoat").category("Jacket").sizes(Arrays.asList("M","L","XL")).colors(Arrays.asList("Camel","Navy")).description("Double-breasted wool-blend overcoat with peak lapels. Luxurious warmth meets refined tailoring.").price(245.00).stock(50).imageUrl("https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Knitted Polo").category("T-shirt").sizes(Arrays.asList("S","M","L")).colors(Arrays.asList("Navy","Cream")).description("Fine-gauge knitted polo with mother-of-pearl buttons. Elevates any casual outfit effortlessly.").price(79.00).stock(50).imageUrl("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Tailored Trousers").category("Pants").sizes(Arrays.asList("30","32","34")).colors(Arrays.asList("Charcoal","Navy")).description("Sharply tailored trousers with pressed creases and a comfortable mid-rise waist.").price(95.00).stock(50).imageUrl("https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Henley Shirt").category("T-shirt").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Burgundy","Grey")).description("Soft-washed cotton henley with a four-button placket. The perfect weekend companion.").price(42.00).stock(50).imageUrl("https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Chelsea Boots").category("Footwear").sizes(Arrays.asList("8","9","10","11")).colors(Arrays.asList("Tan","Black")).description("Premium suede Chelsea boots with elastic side panels and a stacked leather heel.").price(189.00).stock(50).imageUrl("https://images.unsplash.com/photo-1638247025967-b4e38f7bf9c4?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Trench Coat").category("Outerwear").sizes(Arrays.asList("S","M","L")).colors(Arrays.asList("Beige","Black")).description("Classic double-breasted trench coat with belt and epaulettes. A heritage silhouette.").price(215.00).stock(50).imageUrl("https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Puffer Jacket").category("Outerwear").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Olive","Black")).description("Lightweight down-fill puffer jacket with a packable design. Insulated warmth.").price(135.00).stock(50).imageUrl("https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Shearling Coat").category("Outerwear").sizes(Arrays.asList("M","L")).colors(Arrays.asList("Camel","Ivory")).description("Genuine shearling coat with suede exterior and plush wool lining. Ultimate winter luxury.").price(380.00).stock(50).imageUrl("https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Navy Blazer").category("Blazers").sizes(Arrays.asList("S","M","L","XL")).colors(Arrays.asList("Navy","Grey")).description("Slim-cut two-button blazer in a fine wool blend. Transitions effortlessly from office to evening.").price(175.00).stock(50).imageUrl("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Linen Blazer").category("Blazers").sizes(Arrays.asList("S","M","L")).colors(Arrays.asList("Ecru","White")).description("Unstructured linen blazer for a relaxed, sophisticated look. The ultimate summer piece.").price(145.00).stock(50).imageUrl("https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Slip Dress").category("Dresses").sizes(Arrays.asList("XS","S","M")).colors(Arrays.asList("Black","Champagne")).description("Bias-cut satin slip dress with adjustable straps. Effortlessly chic for day or night.").price(110.00).stock(50).imageUrl("https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Wrap Dress").category("Dresses").sizes(Arrays.asList("S","M","L")).colors(Arrays.asList("Floral","Navy")).description("Fluid wrap-front maxi dress with a flattering V-neckline. Versatile elegance.").price(89.00).stock(50).imageUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Linen Set").category("Sets").sizes(Arrays.asList("XS","S","M")).colors(Arrays.asList("White","Sand")).description("Matching cropped top and wide-leg trouser set in breathable linen. The ultimate summer two-piece.").price(125.00).stock(50).imageUrl("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop").build(),
                Product.builder().name("Knit Set").category("Sets").sizes(Arrays.asList("S","M","L")).colors(Arrays.asList("Cream","Charcoal")).description("Soft-knit relaxed top and jogger set. Luxurious comfort that doesn't compromise style.").price(98.00).stock(50).imageUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop").build()
                ));
                log.info("Inserted 20 seed products into database.");
            }
        } catch (Exception ex) {
            // Do not fail application startup if seed data insert fails in deployment.
            log.error("Product seed failed. Continuing startup without seed data.", ex);
        }
    }

    @Cacheable(value = "productList", key = "#search + '-' + #category + '-' + #minPrice + '-' + #maxPrice + '-' + #sort", unless = "#search != null || #category != null || #minPrice != null || #maxPrice != null")
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

    @Cacheable(value = "productList", key = "#search + '-' + #category + '-' + #minPrice + '-' + #maxPrice + '-' + #sort + '-' + #page + '-' + #pageSize", unless = "#search != null || #category != null || #minPrice != null || #maxPrice != null")
    public PageResponse<Product> getAllProductsPaginated(String search, String category, Double minPrice, Double maxPrice, String sort, int page, int pageSize) {
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

        Pageable pageable = PageRequest.of(Math.max(0, page), pageSize, sorting);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return new PageResponse<>(productPage.getContent(), page, pageSize, productPage.getTotalElements());
    }

    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @CacheEvict(value = {"products", "productList"}, allEntries = true)
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = {"products", "productList"}, key = "#id")
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

    @CacheEvict(value = {"products", "productList", "analytics"}, allEntries = true)
    public void restockAll() {
        List<Product> products = productRepository.findAll();
        products.forEach(p -> p.setStock(50)); // Reset all to 50
        productRepository.saveAll(products);
    }

    @CacheEvict(value = {"products", "productList"}, key = "#id")
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
