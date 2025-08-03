package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomerRequest {
    
    // Note: documentId and userId should NOT be updatable
    
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;
    
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
    
    @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Phone must be between 7-20 digits and can start with +")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;
    
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;
}
