package com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;
}
