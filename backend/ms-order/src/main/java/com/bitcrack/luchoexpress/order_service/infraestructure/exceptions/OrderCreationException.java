package com.bitcrack.luchoexpress.order_service.infraestructure.exceptions;

public class OrderCreationException extends RuntimeException {
    
    public OrderCreationException(String message) {
        super(message);
    }
    
    public OrderCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
