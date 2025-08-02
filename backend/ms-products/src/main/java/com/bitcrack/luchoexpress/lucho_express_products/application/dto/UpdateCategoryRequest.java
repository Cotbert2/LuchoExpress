package com.bitcrack.luchoexpress.lucho_express_products.application.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequest {
    
    @Size(max = 100, message = "Name cannot be longer than 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;
}
