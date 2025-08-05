package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Failed to extract claims from token", e);
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public UUID extractUserId(String token) {
        String userIdStr = extractAllClaims(token).get("userId", String.class);
        return userIdStr != null ? UUID.fromString(userIdStr) : null;
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        // Primero intentar obtener como lista (para compatibilidad futura)
        Object rolesObj = extractAllClaims(token).get("roles");
        if (rolesObj instanceof List) {
            return (List<String>) rolesObj;
        }
        
        // Si no es lista, obtener el rol único y convertirlo a lista
        String role = extractRole(token);
        return role != null ? List.of(role) : List.of();
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Token validation failed", e);
            return false;
        }
    }
}
