package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "tracking-orders-service", url = "${tracking.service.url:http://localhost:8086}")
public interface TrackingOrdersServiceFeignClient {
    
    @PostMapping("/api/tracking")
    ResponseEntity<Map<String, String>> createOrUpdateTracking(
        @RequestHeader("X-API-KEY") String apiKey,
        @RequestBody TrackingStatusDto trackingStatus);
    
    record TrackingStatusDto(
        UUID orderId,
        String orderNumber,
        UUID userId,
        String status,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt
    ) {}
}
