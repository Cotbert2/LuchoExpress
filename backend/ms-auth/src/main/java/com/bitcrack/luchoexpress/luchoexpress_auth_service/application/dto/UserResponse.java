package com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private UUID id;
    private String username;
    private String email;
    private RoleEnum role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
