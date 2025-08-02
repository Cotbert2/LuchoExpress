package com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class OrderTrackingStatusTest {
    
    @Test
    void testCreateOrderTrackingStatus() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        String orderNumber = "ORD-2025-001";
        OrderStatusEnum status = OrderStatusEnum.PENDING;
        LocalDate estimatedDeliveryDate = LocalDate.now().plusDays(3);
        
        OrderTrackingStatus tracking = new OrderTrackingStatus(
            orderId, orderNumber, status, estimatedDeliveryDate, customerId
        );
        
        assertEquals(orderId, tracking.getOrderId());
        assertEquals(orderNumber, tracking.getOrderNumber());
        assertEquals(status, tracking.getStatus());
        assertEquals(estimatedDeliveryDate, tracking.getEstimatedDeliveryDate());
        assertEquals(customerId, tracking.getCustomerId());
        assertNotNull(tracking.getLastUpdatedAt());
    }
    
    @Test
    void testUpdateStatus() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        OrderTrackingStatus tracking = new OrderTrackingStatus(
            orderId, "ORD-2025-001", OrderStatusEnum.PENDING, 
            LocalDate.now().plusDays(3), customerId
        );
        
        LocalDateTime beforeUpdate = tracking.getLastUpdatedAt();
        
        // Small delay to ensure time difference
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        tracking.updateStatus(OrderStatusEnum.SHIPPED, LocalDate.now().plusDays(2));
        
        assertEquals(OrderStatusEnum.SHIPPED, tracking.getStatus());
        assertEquals(LocalDate.now().plusDays(2), tracking.getEstimatedDeliveryDate());
        assertTrue(tracking.getLastUpdatedAt().isAfter(beforeUpdate));
    }
}
