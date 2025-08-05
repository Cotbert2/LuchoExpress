package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.presentation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.application.TrackingService;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.TrackingStatus;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
// @CrossOrigin disabled when using API Gateway - CORS is handled at gateway level
// @CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@RequiredArgsConstructor
@Slf4j
public class TrackingController {
    
    private final TrackingService trackingService;
    
    @PostMapping
    public ResponseEntity<Map<String, String>> updateTrackingStatus(@Valid @RequestBody TrackingStatus trackingStatus) {
        log.info("Received tracking update for order: {} with status: {}", 
                trackingStatus.getOrderNumber(), trackingStatus.getStatus());
        
        try {
            trackingService.updateTrackingStatus(trackingStatus);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Tracking status updated successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error updating tracking status for order: {}", trackingStatus.getOrderNumber(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "Failed to update tracking status");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{orderNumber}")
    public ResponseEntity<?> getTrackingStatus(@PathVariable String orderNumber) {
        log.info("Retrieving tracking status for order: {}", orderNumber);
        
        try {
            TrackingStatus trackingStatus = trackingService.getTrackingStatus(orderNumber);
            
            if (trackingStatus != null) {
                log.info("Successfully retrieved tracking status for order: {} with status: {}", 
                        orderNumber, trackingStatus.getStatus());
                return ResponseEntity.ok(trackingStatus);
            } else {
                log.info("No tracking status found for order: {} in Redis or Order Service", orderNumber);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Order not found");
                errorResponse.put("message", "No tracking information found for order " + orderNumber + ". The order may not exist or may not have been processed yet.");
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
        } catch (Exception e) {
            log.error("Error retrieving tracking status for order: {}", orderNumber, e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "Failed to retrieve tracking status: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Endpoint de prueba para verificar conexión con Redis
    @GetMapping("/test/redis")
    public ResponseEntity<Map<String, String>> testRedis() {
        Map<String, String> response = new HashMap<>();
        try {
            // Crear un objeto de prueba
            TrackingStatus testStatus = new TrackingStatus();
            testStatus.setOrderNumber("TEST-001");
            testStatus.setOrderId(java.util.UUID.randomUUID());
            testStatus.setUserId(java.util.UUID.randomUUID());
            testStatus.setStatus(com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.OrderStatusEnum.PENDING);
            testStatus.setUpdatedAt(java.time.LocalDateTime.now());
            
            trackingService.updateTrackingStatus(testStatus);
            
            TrackingStatus retrieved = trackingService.getTrackingStatus("TEST-001");
            
            if (retrieved != null) {
                response.put("status", "SUCCESS");
                response.put("message", "Redis connection is working correctly");
                response.put("testOrder", retrieved.getOrderNumber());
            } else {
                response.put("status", "FAILED");
                response.put("message", "Could not retrieve test data from Redis");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Redis test failed", e);
            response.put("status", "ERROR");
            response.put("message", "Redis test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
