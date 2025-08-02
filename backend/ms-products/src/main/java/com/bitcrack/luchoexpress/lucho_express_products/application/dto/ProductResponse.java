package com.bitcrack.luchoexpress.lucho_express_products.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private UUID id;
    private UUID categoryId;
    private String name;
    private String imageUrl;
    private String description;
    private BigDecimal price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CategoryResponse category;
}
