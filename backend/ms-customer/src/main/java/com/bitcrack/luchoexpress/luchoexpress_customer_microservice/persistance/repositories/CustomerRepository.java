package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.persistance.repositories;

import com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByDocumentId(String documentId);
    
    @Query("SELECT c FROM Customer c WHERE c.enabled = true")
    List<Customer> findAllEnabled();
    
    @Query("SELECT c FROM Customer c WHERE c.id = :id AND c.enabled = true")
    Optional<Customer> findByIdAndEnabled(@Param("id") UUID id);
    
    boolean existsByEmail(String email);
    
    boolean existsByDocumentId(String documentId);
}
