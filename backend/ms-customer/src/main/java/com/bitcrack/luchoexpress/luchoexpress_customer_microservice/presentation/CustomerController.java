package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.presentation;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CreateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.CustomerResponse;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.dto.UpdateCustomerRequest;
import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.application.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
// @CrossOrigin disabled when using API Gateway - CORS is handled at gateway level
// @CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerController {
    
    private final CustomerService customerService;
    
    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }
    
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<CustomerResponse> getCustomerByUserId(@PathVariable UUID userId) {
        CustomerResponse customer = customerService.getCustomerByUserId(userId);
        return ResponseEntity.ok(customer);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<CustomerResponse> getCustomerByEmail(@PathVariable String email) {
        CustomerResponse customer = customerService.getCustomerByEmail(email);
        return ResponseEntity.ok(customer);
    }
    
    @GetMapping("/document/{documentId}")
    public ResponseEntity<ExistsResponse> checkDocumentIdExists(@PathVariable String documentId) {
        boolean exists = customerService.existsByDocumentId(documentId);
        return ResponseEntity.ok(new ExistsResponse(exists));
    }
    
    @GetMapping("/document/{documentId}/customer")
    public ResponseEntity<CustomerResponse> getCustomerByDocumentId(@PathVariable String documentId) {
        CustomerResponse customer = customerService.getCustomerByDocumentId(documentId);
        return ResponseEntity.ok(customer);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        CustomerResponse customer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(customer);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/exists")
    public ResponseEntity<ExistsResponse> customerExists(@PathVariable UUID id) {
        boolean exists = customerService.customerExists(id);
        return ResponseEntity.ok(new ExistsResponse(exists));
    }
    
    // DTO para la respuesta de exists
    public static class ExistsResponse {
        private boolean exists;
        
        public ExistsResponse(boolean exists) {
            this.exists = exists;
        }
        
        public boolean isExists() {
            return exists;
        }
        
        public void setExists(boolean exists) {
            this.exists = exists;
        }
    }
}
