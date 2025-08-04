package com.bitcrack.luchoexpress.order_service.application.service;

import java.util.UUID;

public interface CustomerServiceClient {
    
    /**
     * Get customer information by user ID
     * @param userId The user ID from the authentication token
     * @return Customer information including the customer ID
     */
    CustomerInfo getCustomerByUserId(UUID userId);
    
    /**
     * DTO for customer information
     */
    record CustomerInfo(
        UUID customerId,
        UUID userId,
        String name,
        String email,
        boolean enabled
    ) {}
}
