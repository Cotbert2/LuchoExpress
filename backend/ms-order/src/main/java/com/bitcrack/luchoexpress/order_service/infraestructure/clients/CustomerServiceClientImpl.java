package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import com.bitcrack.luchoexpress.order_service.application.service.CustomerServiceClient;
import com.bitcrack.luchoexpress.order_service.infraestructure.exceptions.CustomerNotFoundException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerServiceClientImpl implements CustomerServiceClient {
    
    private final CustomerServiceFeignClient customerServiceFeignClient;
    
    @Override
    public CustomerInfo getCustomerByUserId(UUID userId) {
        try {
            log.info("Fetching customer information for user ID: {}", userId);
            
            CustomerServiceFeignClient.CustomerDto customer = customerServiceFeignClient.getCustomerByUserId(userId);
            
            return new CustomerInfo(
                customer.id(),
                customer.userId(),
                customer.name(),
                customer.email(),
                customer.enabled()
            );
            
        } catch (FeignException.NotFound e) {
            log.error("Customer not found for user ID: {}", userId);
            throw new CustomerNotFoundException("Customer not found for user ID: " + userId);
        } catch (FeignException e) {
            log.error("Error communicating with customer service for user ID: {}", userId, e);
            throw new RuntimeException("Error communicating with customer service", e);
        }
    }
    
    @Override
    public CustomerInfo getCustomerById(UUID customerId) {
        try {
            log.info("Fetching customer information for customer ID: {}", customerId);
            
            CustomerServiceFeignClient.CustomerDto customer = customerServiceFeignClient.getCustomerById(customerId);
            
            return new CustomerInfo(
                customer.id(),
                customer.userId(),
                customer.name(),
                customer.email(),
                customer.enabled()
            );
            
        } catch (FeignException.NotFound e) {
            log.error("Customer not found for customer ID: {}", customerId);
            throw new CustomerNotFoundException("Customer not found for customer ID: " + customerId);
        } catch (FeignException e) {
            log.error("Error communicating with customer service for customer ID: {}", customerId, e);
            throw new RuntimeException("Error communicating with customer service", e);
        }
    }
}
