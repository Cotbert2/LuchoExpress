package com.bitcrack.luchoexpress.luchoexpress_auth_service.persistance.repositories;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByUsernameAndEnabled(String username, boolean enabled);
}
