package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.service;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CreateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CustomerResponse;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.UpdateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.mapper.CustomerMapper;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain.Customer;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.infraestructure.exceptions.CustomerAlreadyExistsException;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.infraestructure.exceptions.CustomerNotFoundException;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.persistance.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    
    @Autowired
    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }
    
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        // Verificar si ya existe un cliente con el mismo email o documentId
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new CustomerAlreadyExistsException("Customer with email " + request.getEmail() + " already exists");
        }
        
        if (customerRepository.existsByDocumentId(request.getDocumentId())) {
            throw new CustomerAlreadyExistsException("Customer with document ID " + request.getDocumentId() + " already exists");
        }
        
        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(savedCustomer);
    }
    
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findByEnabledTrue()
                .stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(UUID id) {
        Customer customer = customerRepository.findByIdAndEnabledTrue(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found"));
        
        return customerMapper.toResponse(customer);
    }
    
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with email " + email + " not found"));
        
        return customerMapper.toResponse(customer);
    }
    
    public CustomerResponse updateCustomer(UUID id, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findByIdAndEnabledTrue(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found"));
        
        // Verificar unicidad de email y documentId si se están actualizando
        if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new CustomerAlreadyExistsException("Customer with email " + request.getEmail() + " already exists");
            }
        }
        
        if (request.getDocumentId() != null && !request.getDocumentId().equals(customer.getDocumentId())) {
            if (customerRepository.existsByDocumentId(request.getDocumentId())) {
                throw new CustomerAlreadyExistsException("Customer with document ID " + request.getDocumentId() + " already exists");
            }
        }
        
        customerMapper.updateEntityFromRequest(customer, request);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(updatedCustomer);
    }
    
    public void deleteCustomer(UUID id) {
        Customer customer = customerRepository.findByIdAndEnabledTrue(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer with ID " + id + " not found"));
        
        customer.disable();
        customerRepository.save(customer);
    }
    
    @Transactional(readOnly = true)
    public boolean customerExists(UUID id) {
        return customerRepository.findByIdAndEnabledTrue(id).isPresent();
    }
}
