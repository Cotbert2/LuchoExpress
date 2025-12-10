package com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "chat-service", url = "${chat.service.url:http://localhost:3000}")
public interface ChatServiceFeignClient {
    
    @PostMapping("/api/personal-shoppers")
    PersonalShopperResponseDto createPersonalShopper(@RequestBody CreatePersonalShopperDto request);
    
    record CreatePersonalShopperDto(
        UUID userId,
        String name,
        String email,
        String phone
    ) {}
    
    record PersonalShopperResponseDto(
        UUID id,
        UUID userId,
        String name,
        String email,
        String phone,
        String status,
        int activeOrders,
        boolean enabled
    ) {}
}
