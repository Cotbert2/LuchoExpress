package com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.config;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.RoleEnum;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.User;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.clients.ChatServiceFeignClient;
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
    private final ChatServiceFeignClient chatServiceFeignClient;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRootUser();
        initializePersonalShopperUser();
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
    
    private void initializePersonalShopperUser() {
        if (!userRepository.existsByUsername("personalshopper")) {
            User personalShopperUser = new User(
                "personalshopper",
                passwordEncoder.encode("pspassword123"),
                "ps@luchoexpress.com",
                RoleEnum.PS
            );
            
            User savedUser = userRepository.save(personalShopperUser);
            log.info("Personal Shopper user created successfully");
            log.info("Username: personalshopper");
            log.info("Password: pspassword123");
            log.info("User ID: {}", savedUser.getId());
            log.info("Please change this password in production!");
            
            // Create personal shopper record in ms-chat
            try {
                ChatServiceFeignClient.CreatePersonalShopperDto psDto = 
                    new ChatServiceFeignClient.CreatePersonalShopperDto(
                        savedUser.getId(),
                        "Personal Shopper",
                        savedUser.getEmail(),
                        "+1234567890"
                    );
                chatServiceFeignClient.createPersonalShopper(psDto);
                log.info("Personal shopper record created in ms-chat for user: {}", savedUser.getId());
            } catch (Exception e) {
                log.error("Failed to create personal shopper record in ms-chat: {}", e.getMessage());
                log.warn("Personal shopper user exists in ms-auth but not in ms-chat. Please sync manually or restart ms-chat.");
            }
        } else {
            log.info("Personal Shopper user already exists");
        }
    }
}
