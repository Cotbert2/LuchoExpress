package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.bitcrack.luchoexpress.order_service.application.service.TrackingServiceClient;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrackingServiceClientImpl implements TrackingServiceClient {
    
    private final TrackingServiceFeignClient trackingServiceFeignClient;
    
    @Override
    @Async
    public void notifyOrderCreated(Order order) {
        try {
            log.info("Notifying tracking service of order creation: {}", order.getId());
            
            TrackingServiceFeignClient.OrderNotificationDto notification = 
                new TrackingServiceFeignClient.OrderNotificationDto(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getCustomerId(),
                    order.getStatus().name(),
                    "ORDER_CREATED"
                );
            
            trackingServiceFeignClient.notifyOrderCreated(notification);
            
            log.info("Successfully notified tracking service of order creation: {}", order.getId());
            
        } catch (FeignException e) {
            log.error("Failed to notify tracking service of order creation {}: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order creation
        }
    }
    
    @Override
    @Async
    public void notifyOrderUpdated(Order order) {
        try {
            log.info("Notifying tracking service of order update: {}", order.getId());
            
            TrackingServiceFeignClient.OrderNotificationDto notification = 
                new TrackingServiceFeignClient.OrderNotificationDto(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getCustomerId(),
                    order.getStatus().name(),
                    "ORDER_UPDATED"
                );
            
            trackingServiceFeignClient.notifyOrderUpdated(notification);
            
            log.info("Successfully notified tracking service of order update: {}", order.getId());
            
        } catch (FeignException e) {
            log.error("Failed to notify tracking service of order update {}: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order update
        }
    }
}
