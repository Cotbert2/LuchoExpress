package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerServiceClient {
    
    private final CustomerServiceFeignClient customerServiceFeignClient;
    
    public CustomerServiceFeignClient.CustomerDto getCustomerById(UUID customerId) {
        try {
            log.info("Fetching customer information for customer ID: {}", customerId);
            return customerServiceFeignClient.getCustomerById(customerId);
        } catch (FeignException.NotFound e) {
            log.warn("Customer not found for customer ID: {}", customerId);
            return null;
        } catch (FeignException e) {
            log.error("Error communicating with customer service for customer ID: {}", customerId, e);
            throw new RuntimeException("Error communicating with customer service", e);
        }
    }
}
