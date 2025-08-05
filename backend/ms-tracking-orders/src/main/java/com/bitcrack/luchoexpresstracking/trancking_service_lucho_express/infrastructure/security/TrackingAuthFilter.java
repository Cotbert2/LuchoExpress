package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.application.TrackingService;
import main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.TrackingStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrackingAuthFilter implements Filter {

    private final JwtUtil jwtUtil;
    private final TrackingService trackingService;
    
    @Value("${tracking.post.api-key}")
    private String trackingPostApiKey;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Pattern para GET /api/tracking/{orderNumber}
    private static final Pattern GET_TRACKING_PATTERN = Pattern.compile("^/api/tracking/([^/]+)$");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        log.debug("Processing request: {} {}", method, requestURI);

        // POST /api/tracking - requiere API Key
        if ("POST".equals(method) && "/api/tracking".equals(requestURI)) {
            if (!validateApiKey(httpRequest)) {
                sendUnauthorizedResponse(httpResponse, "Invalid or missing API Key for POST tracking");
                return;
            }
        }
        // GET /api/tracking/{orderNumber} - requiere JWT
        else if ("GET".equals(method) && GET_TRACKING_PATTERN.matcher(requestURI).matches()) {
            Matcher matcher = GET_TRACKING_PATTERN.matcher(requestURI);
            if (matcher.matches()) {
                String orderNumber = matcher.group(1);
                if (!validateJwtForTracking(httpRequest, orderNumber)) {
                    sendForbiddenResponse(httpResponse, "Access denied: insufficient permissions");
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }

    private boolean validateApiKey(HttpServletRequest request) {
        String providedApiKey = request.getHeader("X-API-Key");
        
        if (providedApiKey == null || providedApiKey.trim().isEmpty()) {
            log.warn("Missing API Key for POST /api/tracking");
            return false;
        }
        
        boolean isValid = trackingPostApiKey.equals(providedApiKey);
        if (!isValid) {
            log.warn("Invalid API Key provided for POST /api/tracking: {}", providedApiKey);
        } else {
            log.debug("Valid API Key provided for POST /api/tracking");
        }
        
        return isValid;
    }

    private boolean validateJwtForTracking(HttpServletRequest request, String orderNumber) {
        try {
            // Extraer token JWT
            String token = extractToken(request);
            if (token == null) {
                log.warn("Missing JWT token for GET /api/tracking/{}", orderNumber);
                return false;
            }

            // Validar token
            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid or expired JWT token for GET /api/tracking/{}", orderNumber);
                return false;
            }

            // Extraer información del usuario
            UUID userIdFromToken = jwtUtil.extractUserId(token);
            List<String> roles = jwtUtil.extractRoles(token);

            log.debug("JWT validation for order {}: userId={}, roles={}", orderNumber, userIdFromToken, roles);

            // ROOT y ADMIN tienen acceso completo
            if (roles.contains("ROOT") || roles.contains("ADMIN")) {
                log.debug("Access granted for ROOT/ADMIN user to order {}", orderNumber);
                return true;
            }

            // Para usuarios USER, verificar propiedad del recurso
            if (roles.contains("USER")) {
                return checkUserOwnership(orderNumber, userIdFromToken);
            }

            log.warn("User has no valid roles for access to order {}: {}", orderNumber, roles);
            return false;

        } catch (Exception e) {
            log.error("JWT validation error for order {}", orderNumber, e);
            return false;
        }
    }

    private boolean checkUserOwnership(String orderNumber, UUID userIdFromToken) {
        try {
            TrackingStatus trackingStatus = trackingService.getTrackingStatus(orderNumber);
            if (trackingStatus != null) {
                boolean isOwner = userIdFromToken.equals(trackingStatus.getUserId());
                log.debug("Ownership check for order {}: user {} owns it: {}", 
                         orderNumber, userIdFromToken, isOwner);
                return isOwner;
            }
            log.warn("Tracking status not found for order: {}", orderNumber);
            return false;
        } catch (Exception e) {
            log.error("Error checking ownership for order: {}", orderNumber, e);
            return false;
        }
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("message", message);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Forbidden");
        errorResponse.put("message", message);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
