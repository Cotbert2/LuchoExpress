package com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain.OrderStatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrackingRequest {
    
    @NotNull(message = "Order ID is required")
    private UUID orderId;
    
    @NotNull(message = "Order number is required")
    private String orderNumber;
    
    @NotNull(message = "Status is required")
    private OrderStatusEnum status;
    
    private LocalDate estimatedDeliveryDate;
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
}
