package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "product-service", url = "${product.service.url:http://localhost:8085}")
public interface ProductServiceFeignClient {
    
    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable("id") UUID productId);
    
    @GetMapping("/api/products/{id}/exists")
    ExistsResponse productExists(@PathVariable("id") UUID productId);
    
    // DTOs for Feign communication
    record ProductDto(
        UUID id,
        String name,
        java.math.BigDecimal price,
        UUID categoryId,
        String description,
        String imageUrl
    ) {}
    
    record ExistsResponse(
        boolean exists
    ) {}
}
