package com.bitcrack.luchoexpress.order_service.application.service;

import com.bitcrack.luchoexpress.order_service.application.dto.*;
import com.bitcrack.luchoexpress.order_service.application.mapper.OrderMapper;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import com.bitcrack.luchoexpress.order_service.domain.OrderProduct;
import com.bitcrack.luchoexpress.order_service.infraestructure.exceptions.OrderNotFoundException;
import com.bitcrack.luchoexpress.order_service.infraestructure.exceptions.ProductNotFoundException;
import com.bitcrack.luchoexpress.order_service.infraestructure.exceptions.UnauthorizedAccessException;
import com.bitcrack.luchoexpress.order_service.persistance.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductServiceClient productServiceClient;
    private final TrackingServiceClient trackingServiceClient;
    
    public OrderResponse createOrder(CreateOrderRequest request, Authentication authentication) {
        log.info("Creating order for customer: {}", request.getCustomerId());
        
        // Validate customer matches authenticated user (for CLIENTE role)
        validateCustomerAccess(request.getCustomerId(), authentication);
        
        // Create order entity
        Order order = orderMapper.toEntity(request);
        
        // Validate and add products
        for (CreateOrderProductRequest productRequest : request.getProducts()) {
            ProductValidationResponse productInfo = productServiceClient.validateProduct(productRequest.getProductId());
            
            if (!productInfo.isExists()) {
                throw new ProductNotFoundException("Product with ID " + productRequest.getProductId() + " not found");
            }
            
            OrderProduct orderProduct = new OrderProduct(
                productRequest.getProductId(),
                productRequest.getQuantity(),
                productInfo.getName(),
                productInfo.getPrice()
            );
            
            order.addProduct(orderProduct);
        }
        
        // Calculate total amount
        order.calculateTotalAmount();
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Notify tracking service asynchronously
        try {
            trackingServiceClient.notifyOrderCreated(savedOrder);
        } catch (Exception e) {
            log.error("Failed to notify tracking service for order creation: {}", savedOrder.getId(), e);
            // Continue processing - don't fail the order creation
        }
        
        log.info("Order created successfully with ID: {}", savedOrder.getId());
        return orderMapper.toResponse(savedOrder);
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        UUID customerId = extractCustomerIdFromToken(authentication);
        log.info("Fetching orders for customer: {}", customerId);
        
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(Authentication authentication) {
        // Only ADMIN and ROOT can access all orders
        validateAdminAccess(authentication);
        
        log.info("Fetching all orders");
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id, Authentication authentication) {
        log.info("Fetching order with ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found"));
        
        // Check access permissions
        String role = extractRoleFromToken(authentication);
        UUID userId = extractCustomerIdFromToken(authentication);
        
        if (!order.canBeViewedBy(role, userId)) {
            throw new UnauthorizedAccessException("You don't have permission to view this order");
        }
        
        return orderMapper.toResponse(order);
    }
    
    public OrderResponse updateOrder(UUID id, UpdateOrderRequest request, Authentication authentication) {
        log.info("Updating order with ID: {}", id);
        
        // Only ADMIN and ROOT can update orders
        validateAdminAccess(authentication);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found"));
        
        orderMapper.updateEntityFromRequest(order, request);
        
        // Recalculate total if needed
        order.calculateTotalAmount();
        
        Order updatedOrder = orderRepository.save(order);
        
        // Notify tracking service asynchronously
        try {
            trackingServiceClient.notifyOrderUpdated(updatedOrder);
        } catch (Exception e) {
            log.error("Failed to notify tracking service for order update: {}", updatedOrder.getId(), e);
            // Continue processing - don't fail the order update
        }
        
        log.info("Order updated successfully: {}", updatedOrder.getId());
        return orderMapper.toResponse(updatedOrder);
    }
    
    private void validateCustomerAccess(UUID customerId, Authentication authentication) {
        String role = extractRoleFromToken(authentication);
        
        // ADMIN and ROOT can create orders for any customer
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return;
        }
        
        // CLIENTE can only create orders for themselves
        UUID tokenCustomerId = extractCustomerIdFromToken(authentication);
        if (!customerId.equals(tokenCustomerId)) {
            throw new UnauthorizedAccessException("You can only create orders for yourself");
        }
    }
    
    private void validateAdminAccess(Authentication authentication) {
        String role = extractRoleFromToken(authentication);
        if (!"ADMIN".equals(role) && !"ROOT".equals(role)) {
            throw new UnauthorizedAccessException("You don't have permission to perform this action");
        }
    }
    
    private String extractRoleFromToken(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            // Try to get role as string first (matching ms-auth format)
            String role = jwt.getClaimAsString("role");
            if (role != null) {
                return role;
            }
            
            // Fallback: try to get roles as list
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null && !roles.isEmpty()) {
                return roles.get(0); // Assuming single role per user
            }
        }
        return "USER"; // Default role
    }
    
    private UUID extractCustomerIdFromToken(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            // Try to get userId first (matching ms-auth format)
            String userIdString = jwt.getClaimAsString("userId");
            if (userIdString != null) {
                return UUID.fromString(userIdString);
            }
            
            // Fallback: try to get from sub claim
            userIdString = jwt.getClaimAsString("sub");
            if (userIdString != null) {
                // Check if sub is already a UUID
                try {
                    return UUID.fromString(userIdString);
                } catch (IllegalArgumentException e) {
                    // sub is username, look for userId in other claims
                }
            }
        }
        throw new UnauthorizedAccessException("Invalid token: customer ID not found");
    }
}
