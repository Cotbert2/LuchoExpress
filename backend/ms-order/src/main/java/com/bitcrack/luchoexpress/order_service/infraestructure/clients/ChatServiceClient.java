package com.bitcrack.luchoexpress.order_service.infraestructure.clients;

import java.util.UUID;

public interface ChatServiceClient {
    ChatServiceFeignClient.PersonalShopperDto assignAvailablePersonalShopper();
    ChatServiceFeignClient.PersonalShopperDto getPersonalShopperById(UUID id);
    ChatServiceFeignClient.PersonalShopperDto getPersonalShopperByUserId(UUID userId);
    void assignToOrder(UUID personalShopperId);
    void unassignFromOrder(UUID personalShopperId);
}
