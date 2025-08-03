package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCustomerRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotBlank(message = "Document ID is required")
    @Size(max = 50, message = "Document ID cannot exceed 50 characters")
    private String documentId;
    
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
    
    @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Phone must be between 7-20 digits and can start with +")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;
    
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;
}
