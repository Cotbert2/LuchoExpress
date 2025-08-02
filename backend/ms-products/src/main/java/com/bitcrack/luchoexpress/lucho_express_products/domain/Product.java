package com.bitcrack.luchoexpress.lucho_express_products.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "category_id", nullable = false)
    private UUID categoryId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "image_url", length = 255)
    private String imageUrl;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
    
    public Product(UUID categoryId, String name, String imageUrl, String description, BigDecimal price) {
        this.categoryId = categoryId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
}
