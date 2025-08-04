package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.UUID;

@FeignClient(name = "order-service", url = "${order.service.url:http://localhost:8084}")
public interface OrderServiceFeignClient {
    
    @GetMapping("/api/orders/{orderId}")
    OrderDto getOrderById(@PathVariable("orderId") UUID orderId);
    
    @GetMapping("/api/orders/by-order-number/{orderNumber}")
    OrderDto getOrderByOrderNumber(@PathVariable("orderNumber") String orderNumber);
    
    // DTO for communication with order service
    @JsonIgnoreProperties(ignoreUnknown = true)
    record OrderDto(
        UUID id,
        String orderNumber,
        UUID customerId,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
