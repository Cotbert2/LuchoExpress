package com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.mapper;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.OrderTrackingResponse;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.UpdateTrackingRequest;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain.OrderTrackingStatus;
import org.springframework.stereotype.Component;

@Component
public class OrderTrackingMapper {
    
    public OrderTrackingResponse toResponse(OrderTrackingStatus entity) {
        if (entity == null) {
            return null;
        }
        
        return new OrderTrackingResponse(
            entity.getOrderId(),
            entity.getOrderNumber(),
            entity.getStatus(),
            entity.getEstimatedDeliveryDate(),
            entity.getLastUpdatedAt()
        );
    }
    
    public OrderTrackingStatus toEntity(UpdateTrackingRequest request) {
        if (request == null) {
            return null;
        }
        
        return new OrderTrackingStatus(
            request.getOrderId(),
            request.getOrderNumber(),
            request.getStatus(),
            request.getEstimatedDeliveryDate(),
            request.getCustomerId()
        );
    }
}
