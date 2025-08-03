package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.infraestructure.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserAlreadyHasCustomerException extends RuntimeException {
    
    public UserAlreadyHasCustomerException(String message) {
        super(message);
    }
    
    public UserAlreadyHasCustomerException(String message, Throwable cause) {
        super(message, cause);
    }
}
