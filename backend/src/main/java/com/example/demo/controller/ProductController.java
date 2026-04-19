package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(productService.getAllProducts(search, category, minPrice, maxPrice, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Product> uploadProductImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        Product updateSpec = new Product();
        updateSpec.setImageUrl(fileUrl);
        Product product = productService.updateProduct(id, updateSpec);
        return ResponseEntity.ok(product);
    }

    @PostMapping("/{id}/multiple-images")
    public ResponseEntity<Product> uploadMultipleImages(@PathVariable Long id, @RequestParam("files") MultipartFile[] files) {
        java.util.List<String> fileUrls = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            fileUrls.add(fileStorageService.storeFile(file));
        }
        Product existing = productService.getProductById(id);
        java.util.List<String> currentImages = existing.getMultipleImages();
        if (currentImages == null) {
            currentImages = new java.util.ArrayList<>();
        }
        currentImages.addAll(fileUrls);
        
        Product updateSpec = new Product();
        updateSpec.setMultipleImages(currentImages);
        return ResponseEntity.ok(productService.updateProduct(id, updateSpec));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
