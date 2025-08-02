package com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain.OrderStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    
    private UUID orderId;
    private String orderNumber;
    private OrderStatusEnum status;
    private LocalDate estimatedDeliveryDate;
    private LocalDateTime lastUpdatedAt;
}
