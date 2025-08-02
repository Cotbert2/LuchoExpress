package com.bitcrack.luchoexpress.order_service.application.dto;

import com.bitcrack.luchoexpress.order_service.domain.OrderStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    
    private UUID id;
    private String orderNumber;
    private UUID customerId;
    private List<OrderProductResponse> products;
    private String deliveryAddress;
    private OrderStatusEnum status;
    private LocalDate orderDate;
    private LocalDate estimatedDeliveryDate;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
