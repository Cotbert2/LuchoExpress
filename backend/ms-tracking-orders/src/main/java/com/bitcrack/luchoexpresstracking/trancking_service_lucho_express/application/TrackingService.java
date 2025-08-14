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
        return getTrackingStatus(orderNumber, false);
    }
    
    public TrackingStatus getTrackingStatus(String orderNumber, boolean forceRefresh) {
        String key = TRACKING_KEY_PREFIX + orderNumber;
        log.info("Attempting to retrieve tracking status with key: {}, forceRefresh: {}", key, forceRefresh);
        
        try {
            TrackingStatus cachedStatus = null;
            
            // Si no se fuerza el refresh, intentar obtener desde Redis
            if (!forceRefresh) {
                Boolean keyExists = redisTemplate.hasKey(key);
                log.info("Key exists in Redis: {}", keyExists);
                
                if (keyExists) {
                    cachedStatus = redisTemplate.opsForValue().get(key);
                    log.info("Retrieved cached object from Redis: {}", cachedStatus);
                }
            } else {
                log.info("Force refresh requested, skipping Redis cache lookup");
            }
            
            // Siempre verificar con el servicio de órdenes para detectar inconsistencias
            TrackingStatus trackingFromOrderService = loadTrackingFromOrderService(orderNumber);
            
            if (trackingFromOrderService == null) {
                log.info("Order not found in order service: {}", orderNumber);
                // Si no existe en el servicio de órdenes, eliminar cache obsoleto si existe
                if (cachedStatus != null) {
                    log.warn("Removing obsolete cached data for non-existent order: {}", orderNumber);
                    redisTemplate.delete(key);
                }
                return null;
            }
            
            // Si hay datos en cache y no se fuerza el refresh, comparar consistencia
            if (cachedStatus != null && !forceRefresh) {
                // Verificar si el estado en cache coincide con el del servicio de órdenes
                if (cachedStatus.getStatus().equals(trackingFromOrderService.getStatus()) &&
                    cachedStatus.getUpdatedAt().equals(trackingFromOrderService.getUpdatedAt())) {
                    log.info("Cache is consistent with order service for order: {} with status: {}", 
                            orderNumber, cachedStatus.getStatus());
                    return cachedStatus;
                } else {
                    log.warn("Cache inconsistency detected for order: {}. Cached status: {}, Order service status: {}. Updating cache.",
                            orderNumber, cachedStatus.getStatus(), trackingFromOrderService.getStatus());
                }
            }
            
            // Actualizar cache con los datos más recientes del servicio de órdenes
            updateTrackingStatus(trackingFromOrderService);
            
            log.info("Successfully retrieved tracking status for order: {} with status: {}", 
                    orderNumber, trackingFromOrderService.getStatus());
            
            return trackingFromOrderService;
            
        } catch (ClassCastException e) {
            log.warn("Found corrupted data for order: {}. Deleting and returning null. Error: {}", orderNumber, e.getMessage());
            // Eliminar la clave corrupta y intentar cargar desde el servicio de órdenes
            redisTemplate.delete(key);
            return loadTrackingFromOrderService(orderNumber);
        } catch (Exception e) {
            log.error("Error retrieving tracking status for order: {} with key: {}", orderNumber, key, e);
            // En caso de error, intentar retornar datos desde cache si existen
            try {
                TrackingStatus fallbackStatus = redisTemplate.opsForValue().get(key);
                if (fallbackStatus != null) {
                    log.warn("Returning cached data as fallback for order: {}", orderNumber);
                    return fallbackStatus;
                }
            } catch (Exception fallbackException) {
                log.error("Fallback cache retrieval also failed for order: {}", orderNumber, fallbackException);
            }
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
