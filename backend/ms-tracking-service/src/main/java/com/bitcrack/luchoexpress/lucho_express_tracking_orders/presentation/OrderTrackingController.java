package com.bitcrack.luchoexpress.lucho_express_tracking_orders.presentation;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.OrderTrackingResponse;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.dto.UpdateTrackingRequest;
import com.bitcrack.luchoexpress.lucho_express_tracking_orders.application.service.OrderTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderTrackingController {
    
    private final OrderTrackingService orderTrackingService;
    
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderTrackingResponse> getOrderTracking(
            @PathVariable UUID orderId, 
            Authentication authentication) {
        
        OrderTrackingResponse tracking = orderTrackingService.getOrderTracking(orderId, authentication);
        return ResponseEntity.ok(tracking);
    }
    
    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<OrderTrackingResponse> updateOrderTracking(
            @Valid @RequestBody UpdateTrackingRequest request) {
        
        OrderTrackingResponse tracking = orderTrackingService.updateOrderTracking(request);
        return ResponseEntity.ok(tracking);
    }
}
