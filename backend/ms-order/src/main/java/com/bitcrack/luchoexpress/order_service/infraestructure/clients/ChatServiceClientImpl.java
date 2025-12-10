package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceClientImpl implements ChatServiceClient {
    
    private final ChatServiceFeignClient chatServiceFeignClient;
    
    @Override
    public ChatServiceFeignClient.PersonalShopperDto assignAvailablePersonalShopper() {
        try {
            log.info("Requesting available personal shopper from chat service");
            return chatServiceFeignClient.assignAvailablePersonalShopper();
        } catch (Exception e) {
            log.error("Error assigning personal shopper: {}", e.getMessage());
            throw new RuntimeException("Failed to assign personal shopper", e);
        }
    }
    
    @Override
    public ChatServiceFeignClient.PersonalShopperDto getPersonalShopperById(UUID id) {
        try {
            log.info("Getting personal shopper by id: {}", id);
            return chatServiceFeignClient.getPersonalShopperById(id);
        } catch (Exception e) {
            log.error("Error getting personal shopper by id {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to get personal shopper", e);
        }
    }
    
    @Override
    public ChatServiceFeignClient.PersonalShopperDto getPersonalShopperByUserId(UUID userId) {
        try {
            log.info("Getting personal shopper by user id: {}", userId);
            return chatServiceFeignClient.getPersonalShopperByUserId(userId);
        } catch (Exception e) {
            log.error("Error getting personal shopper by user id {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to get personal shopper by user id", e);
        }
    }
    
    @Override
    public void assignToOrder(UUID personalShopperId) {
        try {
            log.info("Assigning personal shopper {} to order", personalShopperId);
            chatServiceFeignClient.assignToOrder(personalShopperId);
        } catch (Exception e) {
            log.error("Error assigning personal shopper to order: {}", e.getMessage());
            // No lanzar excepción para no bloquear la creación de la orden
            log.warn("Continuing without personal shopper assignment");
        }
    }
    
    @Override
    public void unassignFromOrder(UUID personalShopperId) {
        try {
            log.info("Unassigning personal shopper {} from order", personalShopperId);
            chatServiceFeignClient.unassignFromOrder(personalShopperId);
        } catch (Exception e) {
            log.error("Error unassigning personal shopper from order: {}", e.getMessage());
            // No lanzar excepción
            log.warn("Could not unassign personal shopper");
        }
    }
}
