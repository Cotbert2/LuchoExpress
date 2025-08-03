package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.persistance.repositories;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByDocumentId(String documentId);
    
    Optional<Customer> findByUserId(UUID userId);
    
    Optional<Customer> findByUserIdAndEnabledTrue(UUID userId);
    
    List<Customer> findByEnabledTrue();
    
    Optional<Customer> findByIdAndEnabledTrue(UUID id);
    
    boolean existsByEmail(String email);
    
    boolean existsByDocumentId(String documentId);
    
    boolean existsByUserId(UUID userId);
    
    boolean existsByEmailAndIdNot(String email, UUID id);
    
    boolean existsByDocumentIdAndIdNot(String documentId, UUID id);
    
    boolean existsByUserIdAndIdNot(UUID userId, UUID id);
}
