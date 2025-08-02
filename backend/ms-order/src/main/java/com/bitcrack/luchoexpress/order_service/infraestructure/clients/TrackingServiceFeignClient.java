package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "tracking-service", url = "${tracking.service.url:http://localhost:8085}")
public interface TrackingServiceFeignClient {
    
    @PostMapping("/api/tracking/order-created")
    void notifyOrderCreated(@RequestBody OrderNotificationDto notification);
    
    @PostMapping("/api/tracking/order-updated")
    void notifyOrderUpdated(@RequestBody OrderNotificationDto notification);
    
    // DTO for tracking service communication
    record OrderNotificationDto(
        UUID orderId,
        String orderNumber,
        UUID customerId,
        String status,
        String eventType
    ) {}
}
