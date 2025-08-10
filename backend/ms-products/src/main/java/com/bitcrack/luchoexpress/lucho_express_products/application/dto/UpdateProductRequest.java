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
public class UpdateProductRequest {
    
    private UUID categoryId;
    
    @Size(max = 100, message = "Name cannot be longer than 100 characters")
    private String name;
    
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|avif|JPG|JPEG|PNG|GIF|BMP|WEBP|SVG|TIFF|TIF|ICO|AVIF)(\\?.*)?$|^(https?://).*(image|img|photo|picture|pic|IMAGE|IMG|PHOTO|PICTURE|PIC).*$", 
             message = "Image URL must be a valid HTTP/HTTPS URL pointing to an image file or containing image-related keywords")
    private String imageUrl;
    
    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;
    
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;
}
