package com.bitcrack.luchoexpress.lucho_express_products.presentation;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.CreateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.ProductResponse;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.UpdateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.service.ProductService;
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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/products/{id}")
    // No @PreAuthorize - endpoint público para que Order Service pueda acceder
    public ResponseEntity<ProductResponse> getProductById(@PathVariable UUID id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/products")
    // No @PreAuthorize - endpoint público para listar productos
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @PatchMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }
}
