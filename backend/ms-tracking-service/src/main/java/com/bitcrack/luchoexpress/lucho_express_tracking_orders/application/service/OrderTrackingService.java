package com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.service;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.OrderTrackingResponse;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.UpdateTrackingRequest;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.mapper.OrderTrackingMapper;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain.OrderTrackingStatus;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.infrastructure.exceptions.OrderTrackingNotFoundException;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.infrastructure.exceptions.UnauthorizedOperationException;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.persistence.repositories.OrderTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderTrackingService {
    
    private final OrderTrackingRepository orderTrackingRepository;
    private final OrderTrackingMapper orderTrackingMapper;
    private final JwtService jwtService;
    
    public OrderTrackingResponse getOrderTracking(UUID orderId, Authentication authentication) {
        OrderTrackingStatus trackingStatus = orderTrackingRepository.findById(orderId)
                .orElseThrow(() -> new OrderTrackingNotFoundException("Order tracking not found for order ID: " + orderId));
        
        // Validate access permissions
        validateOrderAccess(trackingStatus, authentication);
        
        return orderTrackingMapper.toResponse(trackingStatus);
    }
    
    public OrderTrackingResponse updateOrderTracking(UpdateTrackingRequest request) {
        OrderTrackingStatus existingTracking = orderTrackingRepository.findById(request.getOrderId())
                .orElse(null);
        
        OrderTrackingStatus trackingStatus;
        if (existingTracking != null) {
            // Update existing tracking
            existingTracking.updateStatus(request.getStatus(), request.getEstimatedDeliveryDate());
            trackingStatus = orderTrackingRepository.save(existingTracking);
        } else {
            // Create new tracking
            trackingStatus = orderTrackingMapper.toEntity(request);
            trackingStatus = orderTrackingRepository.save(trackingStatus);
        }
        
        return orderTrackingMapper.toResponse(trackingStatus);
    }
    
    private void validateOrderAccess(OrderTrackingStatus trackingStatus, Authentication authentication) {
        String role = extractRole(authentication);
        String userId = extractUserId(authentication);
        
        // ADMIN and ROOT can access any order
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return;
        }
        
        // USER can only access their own orders
        if ("USER".equals(role)) {
            if (trackingStatus.getCustomerId() == null || 
                !trackingStatus.getCustomerId().toString().equals(userId)) {
                throw new UnauthorizedOperationException("You can only access your own orders");
            }
            return;
        }
        
        throw new UnauthorizedOperationException("Invalid role or unauthorized access");
    }
    
    private String extractRole(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("role");
        }
        throw new UnauthorizedOperationException("Invalid token format");
    }
    
    private String extractUserId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("userId");
        }
        throw new UnauthorizedOperationException("Invalid token format");
    }
}
