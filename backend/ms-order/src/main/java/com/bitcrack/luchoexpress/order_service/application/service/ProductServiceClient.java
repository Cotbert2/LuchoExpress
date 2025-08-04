package com.bitcrack.luchoexpress.order_service.application.service;

import com.bitcrack.luchoexpress.order_service.application.dto.ProductValidationResponse;

import java.util.UUID;

public interface ProductServiceClient {
    
    ProductValidationResponse validateProduct(UUID productId);
}
