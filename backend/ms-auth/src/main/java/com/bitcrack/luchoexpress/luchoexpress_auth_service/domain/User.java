package com.bitcrack.luchoexpress.luchoexpress_auth_service.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", 
       indexes = {
           @Index(name = "idx_users_username", columnList = "username"),
           @Index(name = "idx_users_email", columnList = "email"),
           @Index(name = "idx_users_role", columnList = "role"),
           @Index(name = "idx_users_enabled", columnList = "enabled")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleEnum role = RoleEnum.USER;
    
    @Column(nullable = false)
    private boolean enabled = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructor personalizado para crear usuario
    public User(String username, String passwordHash, String email, RoleEnum role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
        this.role = role != null ? role : RoleEnum.USER;
        this.enabled = true;
    }
    
    // Métodos de negocio
    public void disable() {
        this.enabled = false;
    }
    
    public void enable() {
        this.enabled = true;
    }
    
    public boolean canCreateRole(RoleEnum targetRole) {
        return switch (this.role) {
            case ROOT -> targetRole == RoleEnum.ROOT || targetRole == RoleEnum.ADMIN || targetRole == RoleEnum.USER;
            case ADMIN -> targetRole == RoleEnum.ADMIN || targetRole == RoleEnum.USER;
            case USER -> false;
        };
    }
    
    public boolean canDisableUser(User targetUser) {
        if (this.id.equals(targetUser.getId()) && this.role == RoleEnum.USER) {
            return true; // User can disable their own account
        }
        
        return switch (this.role) {
            case ROOT -> !targetUser.getId().equals(this.id); // ROOT can disable anyone except themselves
            case ADMIN -> targetUser.getRole() == RoleEnum.USER || targetUser.getRole() == RoleEnum.ADMIN;
            case USER -> targetUser.getId().equals(this.id); // Only themselves
        };
    }
    
    public boolean canViewUser(User targetUser) {
        if (this.id.equals(targetUser.getId())) {
            return true; // Can always view own profile
        }
        
        return switch (this.role) {
            case ROOT -> true;
            case ADMIN -> targetUser.getRole() == RoleEnum.USER || targetUser.getRole() == RoleEnum.ADMIN;
            case USER -> false;
        };
    }
    
    public boolean canModifyUser(User targetUser) {
        if (this.id.equals(targetUser.getId())) {
            return true; // Can always modify own profile
        }
        
        return switch (this.role) {
            case ROOT -> true;
            case ADMIN -> targetUser.getRole() == RoleEnum.USER || targetUser.getRole() == RoleEnum.ADMIN;
            case USER -> false;
        };
    }
}
