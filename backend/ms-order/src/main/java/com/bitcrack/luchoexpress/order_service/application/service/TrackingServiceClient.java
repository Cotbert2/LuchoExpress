package com.bitcrack.luchoexpress.order_service.application.service;

import com.bitcrack.luchoexpress.order_service.domain.Order;

public interface TrackingServiceClient {
    
    void notifyOrderCreated(Order order);
    
    void notifyOrderUpdated(Order order);
}
