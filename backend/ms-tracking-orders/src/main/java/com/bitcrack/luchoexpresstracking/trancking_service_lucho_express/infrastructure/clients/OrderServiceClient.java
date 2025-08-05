package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderServiceClient {
    
    private final OrderServiceFeignClient orderServiceFeignClient;
    
    public OrderServiceFeignClient.OrderDto getOrderById(UUID orderId) {
        try {
            log.info("Fetching order information for order ID: {}", orderId);
            return orderServiceFeignClient.getOrderById(orderId);
        } catch (FeignException.NotFound e) {
            log.warn("Order not found for order ID: {}", orderId);
            return null;
        } catch (FeignException e) {
            log.error("Error communicating with order service for order ID: {}", orderId, e);
            throw new RuntimeException("Error communicating with order service", e);
        }
    }
    
    public OrderServiceFeignClient.OrderDto getOrderByOrderNumber(String orderNumber) {
        try {
            log.info("Fetching order information for order number: {}", orderNumber);
            return orderServiceFeignClient.getOrderByOrderNumber(orderNumber);
        } catch (FeignException.NotFound e) {
            log.warn("Order not found for order number: {}", orderNumber);
            return null;
        } catch (FeignException e) {
            log.error("Error communicating with order service for order number: {}", orderNumber, e);
            throw new RuntimeException("Error communicating with order service", e);
        }
    }
}
