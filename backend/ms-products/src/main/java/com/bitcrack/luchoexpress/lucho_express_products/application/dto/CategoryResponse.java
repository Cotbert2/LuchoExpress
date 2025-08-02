package com.bitcrack.luchoexpress.lucho_express_products.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
