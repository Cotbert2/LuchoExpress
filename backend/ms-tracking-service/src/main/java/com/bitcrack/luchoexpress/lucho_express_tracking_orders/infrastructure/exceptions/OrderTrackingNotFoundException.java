package com.bitcrack.luchoexpress.lucho_express_tracking_orders.infrastructure.exceptions;

public class OrderTrackingNotFoundException extends RuntimeException {
    public OrderTrackingNotFoundException(String message) {
        super(message);
    }
    
    public OrderTrackingNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
