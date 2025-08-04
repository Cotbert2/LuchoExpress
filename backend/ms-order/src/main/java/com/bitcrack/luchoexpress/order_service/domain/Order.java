package com.bitcrack.luchoexpress.order_service.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String orderNumber;
    
    @Column(nullable = false)
    private UUID customerId;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<OrderProduct> products = new ArrayList<>();
    
    @Column(nullable = false)
    private String deliveryAddress;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatusEnum status = OrderStatusEnum.PENDING;
    
    @Column(nullable = false)
    private LocalDate orderDate;
    
    private LocalDate estimatedDeliveryDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructor for creating new orders
    public Order(UUID customerId, String deliveryAddress, LocalDate estimatedDeliveryDate) {
        this.customerId = customerId;
        this.deliveryAddress = deliveryAddress;
        this.orderDate = LocalDate.now();
        this.estimatedDeliveryDate = estimatedDeliveryDate;
        this.status = OrderStatusEnum.PENDING;
        this.totalAmount = BigDecimal.ZERO;
    }
    
    // Business methods
    public void addProduct(OrderProduct product) {
        products.add(product);
        product.setOrder(this);  // Establece la relación bidireccional
        calculateTotalAmount();
    }
    
    public void removeProduct(OrderProduct product) {
        products.remove(product);
        calculateTotalAmount();
    }
    
    public void calculateTotalAmount() {
        this.totalAmount = products.stream()
                .map(product -> product.getUnitPrice().multiply(BigDecimal.valueOf(product.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public void updateStatus(OrderStatusEnum newStatus) {
        this.status = newStatus;
    }
    
    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Order cannot be cancelled in current status: " + this.status);
        }
        this.status = OrderStatusEnum.CANCELLED;
    }
    
    public boolean canBeCancelled() {
        // Orders can only be cancelled if they are in PENDING status
        return this.status == OrderStatusEnum.PENDING;
    }
    
    public boolean canBeCancelledBy(String role, UUID customerId) {
        // ADMIN and ROOT can cancel any order (if status allows)
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return canBeCancelled();
        }
        // Customers can only cancel their own orders (if status allows)
        return this.customerId.equals(customerId) && canBeCancelled();
    }
    
    public void updateDeliveryAddress(String newAddress) {
        this.deliveryAddress = newAddress;
    }
    
    public boolean canBeModifiedBy(String role, UUID userId) {
        // ADMIN and ROOT can modify any order
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return true;
        }
        // Customers can only view their own orders, not modify them
        return false;
    }
    
    public boolean canBeViewedBy(String role, UUID userId) {
        // ADMIN and ROOT can view any order
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return true;
        }
        // Customers can only view their own orders
        return this.customerId.equals(userId);
    }
    
    @PrePersist
    private void generateOrderNumber() {
        if (this.orderNumber == null) {
            this.orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
