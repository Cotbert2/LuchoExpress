package com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.config;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.RoleEnum;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.User;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.persistance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRootUser();
    }
    
    private void initializeRootUser() {
        if (!userRepository.existsByUsername("root")) {
            User rootUser = new User(
                "root",
                passwordEncoder.encode("rootpassword123"),
                "root@luchoexpress.com",
                RoleEnum.ROOT
            );
            
            userRepository.save(rootUser);
            log.info("Root user created successfully");
            log.info("Username: root");
            log.info("Password: rootpassword123");
            log.info("Please change this password in production!");
        } else {
            log.info("Root user already exists");
        }
    }
}
