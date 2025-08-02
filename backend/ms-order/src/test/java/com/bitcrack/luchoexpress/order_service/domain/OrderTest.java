package com.bitcrack.luchoexpress.order_service.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {
    
    @Test
    void shouldCreateOrderWithCorrectValues() {
        // Given
        UUID customerId = UUID.randomUUID();
        String deliveryAddress = "Test Address";
        LocalDate estimatedDeliveryDate = LocalDate.now().plusDays(7);
        
        // When
        Order order = new Order(customerId, deliveryAddress, estimatedDeliveryDate);
        
        // Then
        assertNotNull(order);
        assertEquals(customerId, order.getCustomerId());
        assertEquals(deliveryAddress, order.getDeliveryAddress());
        assertEquals(estimatedDeliveryDate, order.getEstimatedDeliveryDate());
        assertEquals(OrderStatusEnum.PENDING, order.getStatus());
        assertEquals(LocalDate.now(), order.getOrderDate());
        assertEquals(BigDecimal.ZERO, order.getTotalAmount());
        assertNotNull(order.getProducts());
        assertTrue(order.getProducts().isEmpty());
    }
    
    @Test
    void shouldCalculateTotalAmountCorrectly() {
        // Given
        Order order = new Order(UUID.randomUUID(), "Test Address", LocalDate.now().plusDays(7));
        
        OrderProduct product1 = new OrderProduct(UUID.randomUUID(), 2, "Product 1", new BigDecimal("10.00"));
        OrderProduct product2 = new OrderProduct(UUID.randomUUID(), 3, "Product 2", new BigDecimal("15.00"));
        
        // When
        order.addProduct(product1);
        order.addProduct(product2);
        
        // Then
        BigDecimal expectedTotal = new BigDecimal("65.00"); // (2*10) + (3*15) = 20 + 45 = 65
        assertEquals(expectedTotal, order.getTotalAmount());
        assertEquals(2, order.getProducts().size());
    }
    
    @Test
    void shouldUpdateStatusCorrectly() {
        // Given
        Order order = new Order(UUID.randomUUID(), "Test Address", LocalDate.now().plusDays(7));
        
        // When
        order.updateStatus(OrderStatusEnum.SHIPPED);
        
        // Then
        assertEquals(OrderStatusEnum.SHIPPED, order.getStatus());
    }
    
    @Test
    void shouldValidateViewPermissionsCorrectly() {
        // Given
        UUID customerId = UUID.randomUUID();
        UUID otherCustomerId = UUID.randomUUID();
        Order order = new Order(customerId, "Test Address", LocalDate.now().plusDays(7));
        
        // Then
        assertTrue(order.canBeViewedBy("ADMIN", otherCustomerId));
        assertTrue(order.canBeViewedBy("ROOT", otherCustomerId));
        assertTrue(order.canBeViewedBy("CLIENTE", customerId));
        assertFalse(order.canBeViewedBy("CLIENTE", otherCustomerId));
    }
}
