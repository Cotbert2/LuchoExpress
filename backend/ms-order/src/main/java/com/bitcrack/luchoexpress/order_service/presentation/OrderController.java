package com.bitcrack.luchoexpress.order_service.presentation;

import com.bitcrack.luchoexpress.order_service.application.dto.CreateOrderRequest;
import com.bitcrack.luchoexpress.order_service.application.dto.OrderResponse;
import com.bitcrack.luchoexpress.order_service.application.dto.UpdateOrderRequest;
import com.bitcrack.luchoexpress.order_service.application.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request, 
            Authentication authentication) {
        log.info("Creating order for customer: {}", request.getCustomerId());
        OrderResponse response = orderService.createOrder(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        log.info("Fetching orders for authenticated user");
        List<OrderResponse> orders = orderService.getMyOrders(authentication);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<List<OrderResponse>> getAllOrders(Authentication authentication) {
        log.info("Fetching all orders");
        List<OrderResponse> orders = orderService.getAllOrders(authentication);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID id, 
            Authentication authentication) {
        log.info("Fetching order with ID: {}", id);
        OrderResponse order = orderService.getOrderById(id, authentication);
        return ResponseEntity.ok(order);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderRequest request,
            Authentication authentication) {
        log.info("Updating order with ID: {}", id);
        OrderResponse order = orderService.updateOrder(id, request, authentication);
        return ResponseEntity.ok(order);
    }
    
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Cancelling order with ID: {}", id);
        OrderResponse order = orderService.cancelOrder(id, authentication);
        return ResponseEntity.ok(order);
    }
}
