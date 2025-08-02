package com.bitcrack.luchoexpress.lucho_express_tracking_orders.persistence.repositories;

import com.bitcrack.luchoexpress.lucho_express_tracking_orders.domain.OrderTrackingStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderTrackingRepository extends CrudRepository<OrderTrackingStatus, UUID> {
}
