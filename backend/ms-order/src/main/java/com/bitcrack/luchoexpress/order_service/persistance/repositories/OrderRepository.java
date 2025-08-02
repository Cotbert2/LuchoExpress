package com.bitcrack.luchoexpress.order_service.persistance.repositories;

import com.bitcrack.luchoexpress.order_service.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    List<Order> findByCustomerId(UUID customerId);
    
    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    
    List<Order> findAllByOrderByCreatedAtDesc();
    
    Optional<Order> findByOrderNumber(String orderNumber);
}
