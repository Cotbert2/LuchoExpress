package com.bitcrack.luchoexpress.lucho_express_products.application.mapper;

import com.bitcrack.luchoexpress.lucho_express_products.application.dto.CreateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.ProductResponse;
import com.bitcrack.luchoexpress.lucho_express_products.application.dto.UpdateProductRequest;
import com.bitcrack.luchoexpress.lucho_express_products.domain.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    
    private final CategoryMapper categoryMapper;
    
    public Product toEntity(CreateProductRequest request) {
        return new Product(
            request.getCategoryId(),
            request.getName(),
            request.getImageUrl(),
            request.getDescription(),
            request.getPrice()
        );
    }
    
    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse(
            product.getId(),
            product.getCategoryId(),
            product.getName(),
            product.getImageUrl(),
            product.getDescription(),
            product.getPrice(),
            product.getCreatedAt(),
            product.getUpdatedAt(),
            null
        );
        
        // Include category if it's loaded
        if (product.getCategory() != null) {
            response.setCategory(categoryMapper.toResponse(product.getCategory()));
        }
        
        return response;
    }
    
    public void updateEntityFromRequest(Product product, UpdateProductRequest request) {
        if (request.getCategoryId() != null) {
            product.setCategoryId(request.getCategoryId());
        }
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
    }
}
