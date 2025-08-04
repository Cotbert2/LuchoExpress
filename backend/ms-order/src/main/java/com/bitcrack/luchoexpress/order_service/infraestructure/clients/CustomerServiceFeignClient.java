package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.UUID;

@FeignClient(name = "customer-service", url = "${customer.service.url:http://localhost:8082}")
public interface CustomerServiceFeignClient {
    
    @GetMapping("/api/customers/by-user/{userId}")
    CustomerDto getCustomerByUserId(@PathVariable("userId") UUID userId);
    
    // DTO for Feign communication
    record CustomerDto(
        UUID id,
        UUID userId,
        String documentId,
        String name,
        String email,
        String phone,
        String address,
        boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
