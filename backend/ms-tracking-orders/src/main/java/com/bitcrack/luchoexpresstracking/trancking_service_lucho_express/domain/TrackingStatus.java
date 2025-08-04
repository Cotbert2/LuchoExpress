package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingStatus implements Serializable {
    
    @NotNull(message = "Order ID is required")
    private UUID orderId;
    
    @NotBlank(message = "Order number is required")
    private String orderNumber;
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Status is required")
    private OrderStatusEnum status;
    
    @NotNull(message = "Updated date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
