package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.TrackingStatus;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    
    private final RedisTemplate<String, TrackingStatus> redisTemplate;
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
                log.info("Key does not exist in Redis: {}", key);
                return null;
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
}
