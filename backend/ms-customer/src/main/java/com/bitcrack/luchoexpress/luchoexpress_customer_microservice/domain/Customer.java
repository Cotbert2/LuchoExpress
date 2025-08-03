package com.bitcrack.luchoexpress.luchoexpress_customer_microservice.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers", 
       indexes = {
           @Index(name = "idx_customers_user_id", columnList = "user_id"),
           @Index(name = "idx_customers_document_id", columnList = "document_id"),
           @Index(name = "idx_customers_email", columnList = "email"),
           @Index(name = "idx_customers_enabled", columnList = "enabled")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;
    
    @NotBlank(message = "Document ID is required")
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Pattern(regexp = "^[+]?[0-9]{7,20}$", message = "Phone must be between 7-20 digits and can start with +")
    @Column(length = 20)
    private String phone;
    
    @Column(length = 255)
    private String address;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;
    
    // Business methods
    public void disable() {
        this.enabled = false;
    }
    
    public void enable() {
        this.enabled = true;
    }
}
