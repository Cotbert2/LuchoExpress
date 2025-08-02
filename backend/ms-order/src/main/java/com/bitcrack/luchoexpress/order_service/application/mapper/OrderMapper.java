package com.bitcrack.luchoexpress.order_service.application.mapper;

import com.bitcrack.luchoexpress.order_service.application.dto.CreateOrderRequest;
import com.bitcrack.luchoexpress.order_service.application.dto.OrderProductResponse;
import com.bitcrack.luchoexpress.order_service.application.dto.OrderResponse;
import com.bitcrack.luchoexpress.order_service.application.dto.UpdateOrderRequest;
import com.bitcrack.luchoexpress.order_service.domain.Order;
import com.bitcrack.luchoexpress.order_service.domain.OrderProduct;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderMapper {
    
    public Order toEntity(CreateOrderRequest request) {
        return new Order(
            request.getCustomerId(),
            request.getDeliveryAddress(),
            request.getEstimatedDeliveryDate()
        );
    }
    
    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getCustomerId(),
            order.getProducts().stream()
                    .map(this::toProductResponse)
                    .collect(Collectors.toList()),
            order.getDeliveryAddress(),
            order.getStatus(),
            order.getOrderDate(),
            order.getEstimatedDeliveryDate(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
    
    public OrderProductResponse toProductResponse(OrderProduct orderProduct) {
        return new OrderProductResponse(
            orderProduct.getId(),
            orderProduct.getProductId(),
            orderProduct.getQuantity(),
            orderProduct.getProductName(),
            orderProduct.getUnitPrice(),
            orderProduct.getTotalPrice()
        );
    }
    
    public void updateEntityFromRequest(Order order, UpdateOrderRequest request) {
        if (request.getStatus() != null) {
            order.updateStatus(request.getStatus());
        }
        if (request.getDeliveryAddress() != null && !request.getDeliveryAddress().trim().isEmpty()) {
            order.updateDeliveryAddress(request.getDeliveryAddress());
        }
        if (request.getEstimatedDeliveryDate() != null) {
            order.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());
        }
    }
}
