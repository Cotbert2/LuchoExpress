package com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("order_tracking")
public class OrderTrackingStatus {
    
    @Id
    private UUID orderId;
    
    private String orderNumber;
    
    private OrderStatusEnum status;
    
    private LocalDate estimatedDeliveryDate;
    
    private LocalDateTime lastUpdatedAt;
    
    private UUID customerId; // For customer validation
    
    public OrderTrackingStatus(UUID orderId, String orderNumber, OrderStatusEnum status, 
                             LocalDate estimatedDeliveryDate, UUID customerId) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.status = status;
        this.estimatedDeliveryDate = estimatedDeliveryDate;
        this.customerId = customerId;
        this.lastUpdatedAt = LocalDateTime.now();
    }
    
    public void updateStatus(OrderStatusEnum newStatus, LocalDate newEstimatedDeliveryDate) {
        this.status = newStatus;
        this.estimatedDeliveryDate = newEstimatedDeliveryDate;
        this.lastUpdatedAt = LocalDateTime.now();
    }
}
