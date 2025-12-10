package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDateTime;
import java.util.UUID;

@FeignClient(name = "chat-service", url = "${chat.service.url:http://localhost:3000}")
public interface ChatServiceFeignClient {
    
    @GetMapping("/api/personal-shoppers/available/assign")
    PersonalShopperDto assignAvailablePersonalShopper();
    
    @GetMapping("/api/personal-shoppers/{id}")
    PersonalShopperDto getPersonalShopperById(@PathVariable("id") UUID id);
    
    @GetMapping("/api/personal-shoppers/by-user/{userId}")
    PersonalShopperDto getPersonalShopperByUserId(@PathVariable("userId") UUID userId);
    
    @PostMapping("/api/personal-shoppers/{id}/assign-order")
    void assignToOrder(@PathVariable("id") UUID personalShopperId);
    
    @PostMapping("/api/personal-shoppers/{id}/unassign-order")
    void unassignFromOrder(@PathVariable("id") UUID personalShopperId);
    
    // DTO for Feign communication
    record PersonalShopperDto(
        UUID id,
        UUID userId,
        String name,
        String email,
        String phone,
        String status,
        int activeOrders,
        boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
