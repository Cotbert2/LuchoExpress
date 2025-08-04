package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.bitcrack.luchoexpress.order_service.application.service.CustomerServiceClient;
import com.bitcrack.luchoexpress.order_service.application.service.TrackingServiceClient;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrackingServiceClientImpl implements TrackingServiceClient {
    
    private final TrackingOrdersServiceFeignClient trackingOrdersServiceFeignClient;
    private final CustomerServiceClient customerServiceClient;
    
    @Override
    @Async
    public void notifyOrderCreated(Order order) {
        try {
            log.info("Creating tracking for order: {}", order.getId());
            
            // Get customer information to obtain userId
            CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerById(order.getCustomerId());
            
            TrackingOrdersServiceFeignClient.TrackingStatusDto trackingStatus = 
                new TrackingOrdersServiceFeignClient.TrackingStatusDto(
                    order.getId(),
                    order.getOrderNumber(),
                    customerInfo.userId(),
                    order.getStatus().name(),
                    LocalDateTime.now()
                );
            
            trackingOrdersServiceFeignClient.createOrUpdateTracking(trackingStatus);
            
            log.info("Successfully created tracking for order: {}", order.getId());
            
        } catch (FeignException e) {
            log.error("Failed to create tracking for order {}: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order creation
        } catch (Exception e) {
            log.error("Failed to create tracking for order {} due to customer service error: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order creation
        }
    }
    
    @Override
    @Async
    public void notifyOrderUpdated(Order order) {
        try {
            log.info("Updating tracking for order: {}", order.getId());
            
            // Get customer information to obtain userId
            CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerById(order.getCustomerId());
            
            TrackingOrdersServiceFeignClient.TrackingStatusDto trackingStatus = 
                new TrackingOrdersServiceFeignClient.TrackingStatusDto(
                    order.getId(),
                    order.getOrderNumber(),
                    customerInfo.userId(),
                    order.getStatus().name(),
                    LocalDateTime.now()
                );
            
            trackingOrdersServiceFeignClient.createOrUpdateTracking(trackingStatus);
            
            log.info("Successfully updated tracking for order: {}", order.getId());
            
        } catch (FeignException e) {
            log.error("Failed to update tracking for order {}: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order update
        } catch (Exception e) {
            log.error("Failed to update tracking for order {} due to customer service error: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order update
        }
    }
}
