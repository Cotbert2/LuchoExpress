package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.bitcrack.luchoexpress.order_service.application.service.CustomerServiceClient;
import com.bitcrack.luchoexpress.order_service.application.service.TrackingServiceClient;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrackingServiceClientImpl implements TrackingServiceClient {
    
    private final TrackingOrdersServiceFeignClient trackingOrdersServiceFeignClient;
    private final CustomerServiceClient customerServiceClient;
    
    @Value("${microservices.api-key}")
    private String apiKey;
    
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
            
            // Intentar crear el tracking con reintentos
            boolean success = updateTrackingWithRetry(trackingStatus, 3);
            
            if (success) {
                log.info("Successfully created tracking for order: {}", order.getId());
            } else {
                log.error("Failed to create tracking for order {} after all retry attempts", order.getId());
            }
            
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
            
            // Intentar actualizar el tracking con reintentos
            boolean success = updateTrackingWithRetry(trackingStatus, 3);
            
            if (success) {
                log.info("Successfully updated tracking for order: {}", order.getId());
            } else {
                log.error("Failed to update tracking for order {} after all retry attempts", order.getId());
            }
            
        } catch (FeignException e) {
            log.error("Failed to update tracking for order {}: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order update
        } catch (Exception e) {
            log.error("Failed to update tracking for order {} due to customer service error: {}", order.getId(), e.getMessage());
            // Don't rethrow - this should not fail the order update
        }
    }
    
    private boolean updateTrackingWithRetry(TrackingOrdersServiceFeignClient.TrackingStatusDto trackingStatus, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                trackingOrdersServiceFeignClient.createOrUpdateTracking(apiKey, trackingStatus);
                log.info("Tracking update successful on attempt {} for order: {}", attempt, trackingStatus.orderNumber());
                return true;
            } catch (Exception e) {
                log.warn("Tracking update failed on attempt {} for order: {}. Error: {}", 
                        attempt, trackingStatus.orderNumber(), e.getMessage());
                
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(1000 * attempt); // Exponential backoff: 1s, 2s, 3s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Thread interrupted during retry delay for order: {}", trackingStatus.orderNumber());
                        return false;
                    }
                }
            }
        }
        return false;
    }
}
