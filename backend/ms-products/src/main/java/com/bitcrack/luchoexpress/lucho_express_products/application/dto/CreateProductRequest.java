package com.bitcrack.luchoexpress.lucho_express_products.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    
    @NotNull(message = "Category ID cannot be null")
    private UUID categoryId;
    
    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name cannot be longer than 100 characters")
    private String name;
    
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|bmp|webp)$", 
             message = "Image URL must be a valid URL ending with a valid image extension")
    private String imageUrl;
    
    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;
    
    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;
}
