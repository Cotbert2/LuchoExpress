package com.bitcrack.luchoexpress.lucho_express_products.presentation;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.*;
import com.bitcrack.luchoexpress.lucho_express_products.application.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
// @CrossOrigin disabled when using API Gateway - CORS is handled at gateway level
// @CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PatchMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/categories-with-products")
    public ResponseEntity<List<CategoryWithProductsResponse>> getCategoriesWithProducts() {
        List<CategoryWithProductsResponse> response = categoryService.getCategoriesWithProducts();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/categories/{id}/products")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable UUID id) {
        List<ProductResponse> products = categoryService.getProductsByCategory(id);
        return ResponseEntity.ok(products);
    }
}
