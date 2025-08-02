package com.bitcrack.luchoexpress.order_service.application.dto;

import com.bitcrack.luchoexpress.order_service.domain.OrderStatusEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderRequest {
    
    private OrderStatusEnum status;
    
    @NotBlank(message = "Delivery address cannot be blank")
    private String deliveryAddress;
    
    private LocalDate estimatedDeliveryDate;
}
