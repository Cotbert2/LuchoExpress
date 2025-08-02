package com.bitcrack.luchoexpress.lucho_express_tracking_orders.infrastructure.exceptions;

public class RedisConnectionException extends RuntimeException {
    public RedisConnectionException(String message) {
        super(message);
    }
    
    public RedisConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
