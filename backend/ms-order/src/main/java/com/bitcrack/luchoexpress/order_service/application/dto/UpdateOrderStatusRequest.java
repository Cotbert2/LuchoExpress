package com.bitcrack.luchoexpress.order_service.application.dto;

import com.bitcrack.luchoexpress.order_service.domain.OrderStatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    
    @NotNull(message = "Status is required")
    private OrderStatusEnum status;
}
