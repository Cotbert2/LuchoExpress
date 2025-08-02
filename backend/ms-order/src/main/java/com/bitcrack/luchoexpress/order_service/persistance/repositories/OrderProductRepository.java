package com.bitcrack.luchoexpress.order_service.persistance.repositories;

import com.bitcrack.luchoexpress.order_service.domain.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderProductRepository extends JpaRepository<OrderProduct, UUID> {
    
    List<OrderProduct> findByOrderId(UUID orderId);
    
    void deleteByOrderId(UUID orderId);
}
