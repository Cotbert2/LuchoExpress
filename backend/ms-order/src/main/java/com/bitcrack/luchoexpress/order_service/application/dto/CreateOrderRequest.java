package com.bitcrack.luchoexpress.order_service.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    @NotEmpty(message = "Products list cannot be empty")
    @Valid
    private List<CreateOrderProductRequest> products;
    
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    
    private LocalDate estimatedDeliveryDate;
}
