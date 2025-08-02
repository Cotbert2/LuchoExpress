package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.mapper;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CreateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CustomerResponse;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.UpdateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {
    
    public Customer toEntity(CreateCustomerRequest request) {
        return new Customer(
            request.getDocumentId(),
            request.getName(),
            request.getEmail(),
            request.getPhone(),
            request.getAddress()
        );
    }
    
    public CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getDocumentId(),
            customer.getName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getAddress(),
            customer.getCreatedAt(),
            customer.getUpdatedAt(),
            customer.isEnabled()
        );
    }
    
    public void updateEntityFromRequest(Customer customer, UpdateCustomerRequest request) {
        if (request.getDocumentId() != null) {
            customer.setDocumentId(request.getDocumentId());
        }
        if (request.getName() != null) {
            customer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }
    }
}
