package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.OrderStatusEnum;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.TrackingStatus;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.OrderServiceClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.OrderServiceFeignClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.CustomerServiceClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.CustomerServiceFeignClient;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    
    private final RedisTemplate<String, TrackingStatus> redisTemplate;
    private final OrderServiceClient orderServiceClient;
    private final CustomerServiceClient customerServiceClient;
    private static final String TRACKING_KEY_PREFIX = "tracking:order:";
    private static final long TTL_HOURS = 1;
    
    public void updateTrackingStatus(TrackingStatus trackingStatus) {
        String key = TRACKING_KEY_PREFIX + trackingStatus.getOrderNumber();
        
        // Verificar si la clave existe
        if (redisTemplate.hasKey(key)) {
            log.info("Updating tracking status for order: {}", trackingStatus.getOrderNumber());
        } else {
            log.info("Creating new tracking status for order: {}", trackingStatus.getOrderNumber());
        }
        
        // Guardar en Redis con TTL de 1 hora
        redisTemplate.opsForValue().set(key, trackingStatus, TTL_HOURS, TimeUnit.HOURS);
        
        log.debug("Tracking status saved in Redis with key: {} and TTL: {} hours", key, TTL_HOURS);
    }
    
    public TrackingStatus getTrackingStatus(String orderNumber) {
        String key = TRACKING_KEY_PREFIX + orderNumber;
        log.info("Attempting to retrieve tracking status with key: {}", key);
        
        try {
            // Verificar si la clave existe
            Boolean keyExists = redisTemplate.hasKey(key);
            log.info("Key exists in Redis: {}", keyExists);
            
            if (!keyExists) {
                log.info("Key does not exist in Redis: {}. Trying to load from order service...", key);
                
                // Intentar cargar desde el servicio de órdenes
                TrackingStatus trackingFromOrderService = loadTrackingFromOrderService(orderNumber);
                if (trackingFromOrderService != null) {
                    // Guardar en caché y retornar
                    updateTrackingStatus(trackingFromOrderService);
                    return trackingFromOrderService;
                } else {
                    log.info("Order not found in order service: {}", orderNumber);
                    return null;
                }
            }
            
            TrackingStatus trackingStatus = redisTemplate.opsForValue().get(key);
            log.info("Retrieved object from Redis: {}", trackingStatus);
            
            if (trackingStatus != null) {
                log.info("Successfully retrieved tracking status for order: {} with status: {}", 
                        orderNumber, trackingStatus.getStatus());
            } else {
                log.warn("Retrieved null value from Redis for existing key: {}", key);
            }
            
            return trackingStatus;
            
        } catch (ClassCastException e) {
            log.warn("Found corrupted data for order: {}. Deleting and returning null. Error: {}", orderNumber, e.getMessage());
            // Eliminar la clave corrupta para que se pueda crear nuevamente
            redisTemplate.delete(key);
            return null;
        } catch (Exception e) {
            log.error("Error retrieving tracking status for order: {} with key: {}", orderNumber, key, e);
            throw e;
        }
    }
    
    private TrackingStatus loadTrackingFromOrderService(String orderNumber) {
        try {
            log.info("Loading order information from order service for orderNumber: {}", orderNumber);
            
            OrderServiceFeignClient.OrderDto orderDto = orderServiceClient.getOrderByOrderNumber(orderNumber);
            
            if (orderDto != null) {
                log.info("Found order in order service: {}", orderDto);
                
                // Crear TrackingStatus desde la información de la orden
                TrackingStatus trackingStatus = new TrackingStatus();
                trackingStatus.setOrderId(orderDto.id());
                trackingStatus.setOrderNumber(orderDto.orderNumber());
                
                // Obtener el userId del customer
                UUID userId = getUserIdFromCustomer(orderDto.customerId());
                if (userId != null) {
                    trackingStatus.setUserId(userId);
                } else {
                    log.warn("Could not get userId for customerId: {}, using customerId as fallback", orderDto.customerId());
                    trackingStatus.setUserId(orderDto.customerId()); // Fallback si no se encuentra el customer
                }
                
                trackingStatus.setStatus(OrderStatusEnum.valueOf(orderDto.status()));
                trackingStatus.setUpdatedAt(orderDto.updatedAt());
                
                return trackingStatus;
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("Error loading order from order service for orderNumber: {}", orderNumber, e);
            return null;
        }
    }
    
    private UUID getUserIdFromCustomer(UUID customerId) {
        try {
            log.info("Fetching userId for customerId: {}", customerId);
            CustomerServiceFeignClient.CustomerDto customerDto = customerServiceClient.getCustomerById(customerId);
            
            if (customerDto != null) {
                log.info("Found customer for customerId: {}, userId: {}", customerId, customerDto.userId());
                return customerDto.userId();
            } else {
                log.warn("Customer not found for customerId: {}", customerId);
                return null;
            }
            
        } catch (Exception e) {
            log.error("Error fetching customer for customerId: {}", customerId, e);
            return null;
        }
    }
}
