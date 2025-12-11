package com.bitcrack.luchoexpress.order_service.application.service;

import com.bitcrack.luchoexpress.order_service.application.dto.*;
import com.bitcrack.luchoexpress.order_service.application.mapper.OrderMapper;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import com.bitcrack.luchoexpress.order_service.domain.OrderProduct;
import com.bitcrack.luchoexpress.order_service.domain.OrderStatusEnum;
import com.bitcrack.luchoexpress.order_service.infraestructure.clients.ChatServiceClient;
import com.bitcrack.luchoexpress.order_service.infraestructure.clients.ChatServiceFeignClient;
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
    private final CustomerServiceClient customerServiceClient;
    private final ChatServiceClient chatServiceClient;
    
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
        
        // Assign personal shopper
        try {
            ChatServiceFeignClient.PersonalShopperDto personalShopper = chatServiceClient.assignAvailablePersonalShopper();
            order.setPersonalShopperId(personalShopper.id());
            chatServiceClient.assignToOrder(personalShopper.id());
            log.info("Personal shopper {} assigned to order", personalShopper.id());
        } catch (Exception e) {
            log.error("Failed to assign personal shopper: {}", e.getMessage());
            // Continue without personal shopper - can be assigned later
        }
        
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
        // Extract userId from token, then get the associated customer
        UUID userId = extractUserIdFromToken(authentication);
        CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerByUserId(userId);
        UUID customerId = customerInfo.customerId();
        
        log.info("Fetching orders for customer: {} (user: {})", customerId, userId);
        
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
    public List<OrderResponse> getMyOrdersAsPersonalShopper(Authentication authentication) {
        // Extract userId from token to get the personal shopper
        UUID userId = extractUserIdFromToken(authentication);
        
        try {
            // Get personal shopper from ms-chat by userId
            ChatServiceFeignClient.PersonalShopperDto personalShopper = chatServiceClient.getPersonalShopperByUserId(userId);
            
            log.info("Fetching orders for personal shopper: {} (user: {})", personalShopper.id(), userId);
            
            List<Order> orders = orderRepository.findByPersonalShopperIdOrderByCreatedAtDesc(personalShopper.id());
            return orders.stream()
                    .map(orderMapper::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch personal shopper for user {}: {}", userId, e.getMessage());
            throw new UnauthorizedAccessException("You are not registered as a personal shopper");
        }
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id, Authentication authentication) {
        log.info("Fetching order with ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found"));
        
        // Check access permissions
        String role = extractRoleFromToken(authentication);
        UUID userId = extractUserIdFromToken(authentication);
        
        // Admin/Root can view any order
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return orderMapper.toResponse(order);
        }
        
        // Personal Shopper can view their assigned orders
        if ("PS".equals(role)) {
            try {
                ChatServiceFeignClient.PersonalShopperDto personalShopper = chatServiceClient.getPersonalShopperByUserId(userId);
                if (order.canBeViewedByPersonalShopper(personalShopper.id())) {
                    return orderMapper.toResponse(order);
                }
            } catch (Exception e) {
                log.error("Failed to fetch personal shopper for user {}: {}", userId, e.getMessage());
            }
            throw new UnauthorizedAccessException("You don't have permission to view this order");
        }
        
        // For regular users, get their customerId from the customer service
        CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerByUserId(userId);
        UUID customerId = customerInfo.customerId();
        
        if (!order.canBeViewedBy(role, customerId)) {
            throw new UnauthorizedAccessException("You don't have permission to view this order");
        }
        
        return orderMapper.toResponse(order);
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber, Authentication authentication) {
        log.info("Fetching order with order number: {}", orderNumber);
        
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order with order number " + orderNumber + " not found"));
        
        // Check access permissions
        String role = extractRoleFromToken(authentication);
        
        UUID customerId;
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            // Admin/Root can view any order, use the order's customerId
            customerId = order.getCustomerId();
        } else {
            // For regular users, get their customerId from the customer service
            UUID userId = extractUserIdFromToken(authentication);
            CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerByUserId(userId);
            customerId = customerInfo.customerId();
        }
        
        if (!order.canBeViewedBy(role, customerId)) {
            throw new UnauthorizedAccessException("You don't have permission to view this order");
        }
        
        return orderMapper.toResponse(order);
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumberPublic(String orderNumber) {
        log.info("Fetching order with order number (public): {}", orderNumber);
        
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order with order number " + orderNumber + " not found"));
        
        // Public access - no authentication required, return basic order information
        return orderMapper.toResponse(order);
    }
    
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatusEnum newStatus, Authentication authentication) {
        log.info("Updating order {} status to: {}", orderId, newStatus);
        
        // Get the role to determine permissions
        String role = extractRoleFromToken(authentication);
        UUID userId = extractUserIdFromToken(authentication);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + orderId + " not found"));
        
        // Validate permissions based on role
        if ("PS".equals(role)) {
            // Personal shopper can only update their assigned orders
            try {
                ChatServiceFeignClient.PersonalShopperDto personalShopper = chatServiceClient.getPersonalShopperByUserId(userId);
                if (!personalShopper.id().equals(order.getPersonalShopperId())) {
                    throw new UnauthorizedAccessException("You can only update orders assigned to you");
                }
                
                // Personal shoppers can only transition through specific states
                validatePersonalShopperStatusTransition(order.getStatus(), newStatus);
            } catch (Exception e) {
                log.error("Failed to validate personal shopper access: {}", e.getMessage());
                throw new UnauthorizedAccessException("You don't have permission to update this order");
            }
        } else if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            // Admin and ROOT can update to any status
            log.info("Admin/Root updating order status");
        } else {
            throw new UnauthorizedAccessException("Only personal shoppers and admins can update order status");
        }
        
        // Store old status for comparison
        OrderStatusEnum oldStatus = order.getStatus();
        
        // Update status
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        // If order status changed to DELIVERED, unassign personal shopper
        if (updatedOrder.getPersonalShopperId() != null && 
            newStatus == OrderStatusEnum.DELIVERED &&
            oldStatus != OrderStatusEnum.DELIVERED) {
            try {
                chatServiceClient.unassignFromOrder(updatedOrder.getPersonalShopperId());
                log.info("Personal shopper {} unassigned from delivered order", updatedOrder.getPersonalShopperId());
            } catch (Exception e) {
                log.error("Failed to unassign personal shopper: {}", e.getMessage());
            }
        }
        
        // Notify tracking service asynchronously
        try {
            trackingServiceClient.notifyOrderStatusUpdated(updatedOrder);
        } catch (Exception e) {
            log.error("Failed to notify tracking service for order status update: {}", updatedOrder.getId(), e);
        }
        
        log.info("Order status updated successfully: {} -> {}", oldStatus, newStatus);
        return orderMapper.toResponse(updatedOrder);
    }
    
    private void validatePersonalShopperStatusTransition(OrderStatusEnum currentStatus, OrderStatusEnum newStatus) {
        // Define allowed transitions for personal shoppers
        boolean isValidTransition = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatusEnum.CONFIRMED;
            case CONFIRMED -> newStatus == OrderStatusEnum.SHIPPED;
            case SHIPPED -> newStatus == OrderStatusEnum.DELIVERED;
            case DELIVERED, CANCELLED -> false; // Cannot change from terminal states
        };
        
        if (!isValidTransition) {
            throw new UnauthorizedAccessException(
                String.format("Invalid status transition: %s -> %s. Personal shoppers must follow the workflow: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED", 
                    currentStatus, newStatus)
            );
        }
    }
    
    public OrderResponse updateOrder(UUID id, UpdateOrderRequest request, Authentication authentication) {
        log.info("Updating order with ID: {}", id);
        
        // Only ADMIN and ROOT can update orders
        validateAdminAccess(authentication);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found"));
        
        orderMapper.updateEntityFromRequest(order, request);
        
        // Check if order is being completed or delivered
        OrderStatusEnum oldStatus = order.getStatus();
        
        // Recalculate total if needed
        order.calculateTotalAmount();
        
        Order updatedOrder = orderRepository.save(order);
        
        // If order status changed to DELIVERED or COMPLETED, unassign personal shopper
        if (updatedOrder.getPersonalShopperId() != null && 
            (updatedOrder.getStatus() == OrderStatusEnum.DELIVERED) &&
            (oldStatus != OrderStatusEnum.DELIVERED)) {
            try {
                chatServiceClient.unassignFromOrder(updatedOrder.getPersonalShopperId());
                log.info("Personal shopper {} unassigned from completed order", updatedOrder.getPersonalShopperId());
            } catch (Exception e) {
                log.error("Failed to unassign personal shopper: {}", e.getMessage());
            }
        }
        
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
    
    public OrderResponse cancelOrder(UUID id, Authentication authentication) {
        log.info("Cancelling order with ID: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found"));
        
        // Get the user's customerId for permission validation
        String role = extractRoleFromToken(authentication);
        UUID customerId;
        
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            // Admin/Root use the order's customerId for validation
            customerId = order.getCustomerId();
        } else {
            // For regular users, get their customerId from the customer service
            UUID userId = extractUserIdFromToken(authentication);
            CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerByUserId(userId);
            customerId = customerInfo.customerId();
        }
        
        // Validate if the order can be cancelled by this user
        if (!order.canBeCancelledBy(role, customerId)) {
            if (!order.getCustomerId().equals(customerId)) {
                throw new UnauthorizedAccessException("You can only cancel your own orders");
            } else {
                throw new UnauthorizedAccessException("Order cannot be cancelled in current status: " + order.getStatus());
            }
        }
        
        // Cancel the order
        order.cancel();
        Order cancelledOrder = orderRepository.save(order);
        
        // Unassign personal shopper if assigned
        if (cancelledOrder.getPersonalShopperId() != null) {
            try {
                chatServiceClient.unassignFromOrder(cancelledOrder.getPersonalShopperId());
                log.info("Personal shopper {} unassigned from cancelled order", cancelledOrder.getPersonalShopperId());
            } catch (Exception e) {
                log.error("Failed to unassign personal shopper: {}", e.getMessage());
            }
        }
        
        // Notify tracking service asynchronously
        try {
            trackingServiceClient.notifyOrderUpdated(cancelledOrder);
        } catch (Exception e) {
            log.error("Failed to notify tracking service for order cancellation: {}", cancelledOrder.getId(), e);
            // Continue processing - don't fail the order cancellation
        }
        
        log.info("Order cancelled successfully: {}", cancelledOrder.getId());
        return orderMapper.toResponse(cancelledOrder);
    }
    
    private void validateCustomerAccess(UUID customerId, Authentication authentication) {
        String role = extractRoleFromToken(authentication);
        
        // ADMIN and ROOT can create orders for any customer
        if ("ADMIN".equals(role) || "ROOT".equals(role)) {
            return;
        }

        // For CLIENTE role, verify that the customerId in the request matches
        // the customer associated with the authenticated user
        UUID userId = extractUserIdFromToken(authentication);
        CustomerServiceClient.CustomerInfo customerInfo = customerServiceClient.getCustomerByUserId(userId);
        
        if (!customerInfo.customerId().equals(customerId)) {
            throw new UnauthorizedAccessException(
                String.format("You can only create orders for yourself. " +
                    "Requested customer ID: %s, but your customer ID is: %s", 
                    customerId, customerInfo.customerId())
            );
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
    
    private UUID extractUserIdFromToken(Authentication authentication) {
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
        throw new UnauthorizedAccessException("Invalid token: user ID not found");
    }
}
