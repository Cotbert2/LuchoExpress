package com.bitcrack.luchoexpress.order_service.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderProductRequest {
    
    @NotNull(message = "Product ID is required")
    private UUID productId;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
