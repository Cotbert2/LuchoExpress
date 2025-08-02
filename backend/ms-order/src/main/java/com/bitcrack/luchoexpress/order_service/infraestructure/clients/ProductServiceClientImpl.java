package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.bitcrack.luchoexpress.order_service.application.dto.ProductValidationResponse;
import com.bitcrack.luchoexpress.order_service.application.service.ProductServiceClient;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceClientImpl implements ProductServiceClient {
    
    private final ProductServiceFeignClient productServiceFeignClient;
    
    @Override
    public ProductValidationResponse validateProduct(UUID productId) {
        try {
            log.info("Validating product with ID: {}", productId);
            
            ProductServiceFeignClient.ProductDto product = productServiceFeignClient.getProductById(productId);
            
            return new ProductValidationResponse(
                product.id(),
                product.name(),
                product.price(),
                true
            );
            
        } catch (FeignException.NotFound e) {
            log.warn("Product not found: {}", productId);
            return new ProductValidationResponse(productId, null, null, false);
        } catch (FeignException e) {
            log.error("Error validating product {}: {}", productId, e.getMessage());
            return new ProductValidationResponse(productId, null, null, false);
        }
    }
    
    @Override
    public boolean productExists(UUID productId) {
        try {
            log.info("Checking existence of product with ID: {}", productId);
            
            ProductServiceFeignClient.ExistsResponse response = productServiceFeignClient.productExists(productId);
            return response.exists();
            
        } catch (FeignException e) {
            log.error("Error checking product existence {}: {}", productId, e.getMessage());
            return false;
        }
    }
}
