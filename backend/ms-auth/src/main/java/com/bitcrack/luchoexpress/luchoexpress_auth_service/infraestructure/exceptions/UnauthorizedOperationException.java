package com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.exceptions;

public class UnauthorizedOperationException extends RuntimeException {
    public UnauthorizedOperationException(String message) {
        super(message);
    }
    
    public UnauthorizedOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
