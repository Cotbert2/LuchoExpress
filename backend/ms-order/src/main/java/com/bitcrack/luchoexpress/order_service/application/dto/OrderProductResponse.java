package com.bitcrack.luchoexpress.order_service.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderProductResponse {
    
    private UUID id;
    private UUID productId;
    private int quantity;
    private String productName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
