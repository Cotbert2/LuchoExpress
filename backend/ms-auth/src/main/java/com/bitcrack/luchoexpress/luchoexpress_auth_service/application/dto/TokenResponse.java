package com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    
    public TokenResponse(String accessToken, long expiresIn) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }
}
