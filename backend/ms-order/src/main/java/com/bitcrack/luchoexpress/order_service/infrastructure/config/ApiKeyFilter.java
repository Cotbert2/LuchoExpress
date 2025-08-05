package com.bitcrack.luchoexpress.order_service.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Slf4j
public class ApiKeyFilter implements Filter {

    @Value("${microservices.api-key}")
    private String expectedApiKey;

    @Value("${microservices.auth.enabled:true}")
    private boolean authEnabled;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        // Solo aplicar filtro a endpoints específicos de comunicación entre microservicios
        if (shouldApplyApiKeyFilter(requestURI, method)) {
            
            if (!authEnabled) {
                log.debug("API Key authentication disabled, allowing request to: {}", requestURI);
                chain.doFilter(request, response);
                return;
            }
            
            String providedApiKey = httpRequest.getHeader("X-API-Key");
            
            if (providedApiKey == null || providedApiKey.trim().isEmpty()) {
                log.warn("Missing API Key for microservice endpoint: {} {}", method, requestURI);
                sendUnauthorizedResponse(httpResponse, "Missing API Key header");
                return;
            }
            
            if (!expectedApiKey.equals(providedApiKey)) {
                log.warn("Invalid API Key provided for microservice endpoint: {} {}. Provided: {}", 
                        method, requestURI, providedApiKey);
                sendUnauthorizedResponse(httpResponse, "Invalid API Key");
                return;
            }
            
            log.debug("Valid API Key provided for microservice endpoint: {} {}", method, requestURI);
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean shouldApplyApiKeyFilter(String requestURI, String method) {
        // Aplicar filtro solo a endpoints específicos de comunicación entre microservicios
        return (requestURI.matches("/api/orders/[0-9a-fA-F-]+") && "GET".equals(method)) ||  // GET /api/orders/{orderId}
               (requestURI.matches("/api/orders/by-order-number/.*") && "GET".equals(method)); // GET /api/orders/by-order-number/{orderNumber}
    }
    
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"error\":\"Unauthorized\",\"message\":\"%s\"}", message));
    }
}
