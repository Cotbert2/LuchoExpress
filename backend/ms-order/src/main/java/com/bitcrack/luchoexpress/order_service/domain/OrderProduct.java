package com.bitcrack.luchoexpress.order_service.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_products")
@Data
@NoArgsConstructor
@ToString(exclude = "order") // Evita problemas de recursión infinita
public class OrderProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(nullable = false)
    private UUID productId;
    
    @Column(nullable = false)
    private int quantity;
    
    @Column(nullable = false)
    private String productName; // Copiado al momento del pedido
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice; // Copiado al momento del pedido
    
    // Constructor for creating new order products
    public OrderProduct(UUID productId, int quantity, String productName, BigDecimal unitPrice) {
        this.productId = productId;
        this.quantity = quantity;
        this.productName = productName;
        this.unitPrice = unitPrice;
    }
    
    // Business methods
    public BigDecimal getTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    public void updateQuantity(int newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        this.quantity = newQuantity;
    }
}
