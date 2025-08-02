package com.bitcrack.luchoexpress.lucho_express_products.application.service;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.CreateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.ProductResponse;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.UpdateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.mapper.ProductMapper;
import com.bitcrack.luchoexpress.lucho_express_products.domain.Product;
import com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions.CategoryNotFoundException;
import com.bitcrack.luchoexpress.lucho_express_products.infraestructure.exceptions.ProductNotFoundException;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.CategoryRepository;
import com.bitcrack.luchoexpress.lucho_express_products.persistance.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    
    public ProductResponse createProduct(CreateProductRequest request) {
        // Validate that category exists
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new CategoryNotFoundException("Category with ID " + request.getCategoryId() + " not found");
        }
        
        Product product = productMapper.toEntity(request);
        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }
    
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product with ID " + id + " not found"));
        
        // Validate category exists if changing category
        if (request.getCategoryId() != null && !categoryRepository.existsById(request.getCategoryId())) {
            throw new CategoryNotFoundException("Category with ID " + request.getCategoryId() + " not found");
        }
        
        productMapper.updateEntityFromRequest(product, request);
        Product updatedProduct = productRepository.save(product);
        return productMapper.toResponse(updatedProduct);
    }
}
