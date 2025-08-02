package com.bitcrack.luchoexpress.order_service.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductValidationResponse {
    
    private UUID id;
    private String name;
    private BigDecimal price;
    private boolean exists;
}
