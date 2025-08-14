package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.application;

import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.OrderStatusEnum;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.domain.TrackingStatus;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.OrderServiceClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.OrderServiceFeignClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.CustomerServiceClient;
import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients.CustomerServiceFeignClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock
    private RedisTemplate<String, TrackingStatus> redisTemplate;

    @Mock
    private ValueOperations<String, TrackingStatus> valueOperations;

    @Mock
    private OrderServiceClient orderServiceClient;

    @Mock
    private CustomerServiceClient customerServiceClient;

    @InjectMocks
    private TrackingService trackingService;

    private TrackingStatus sampleTrackingStatus;
    private OrderServiceFeignClient.OrderDto sampleOrderDto;
    private CustomerServiceFeignClient.CustomerDto sampleCustomerDto;
    private final String ORDER_NUMBER = "ORD-2025-0001";
    private final String CACHE_KEY = "tracking:order:" + ORDER_NUMBER;

    @BeforeEach
    void setUp() {
        // Setup mocks
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // Create sample data
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        sampleTrackingStatus = new TrackingStatus();
        sampleTrackingStatus.setOrderId(orderId);
        sampleTrackingStatus.setOrderNumber(ORDER_NUMBER);
        sampleTrackingStatus.setUserId(userId);
        sampleTrackingStatus.setStatus(OrderStatusEnum.PENDING);
        sampleTrackingStatus.setUpdatedAt(LocalDateTime.now());

        sampleOrderDto = new OrderServiceFeignClient.OrderDto(
            orderId,
            ORDER_NUMBER,
            customerId,
            "SHIPPED", // Different status to test inconsistency
            LocalDateTime.now(),
            null
        );

        sampleCustomerDto = new CustomerServiceFeignClient.CustomerDto(
            customerId,
            userId,
            "Test",
            "User",
            "test@example.com",
            "123-456-7890",
            "123 Test St",
            LocalDateTime.now(),
            LocalDateTime.now()
        );
    }

    @Test
    void testGetTrackingStatus_CacheHitConsistent_ReturnsCachedData() {
        // Arrange
        when(redisTemplate.hasKey(CACHE_KEY)).thenReturn(true);
        when(valueOperations.get(CACHE_KEY)).thenReturn(sampleTrackingStatus);
        
        // Make order service return same status as cached data
        OrderServiceFeignClient.OrderDto consistentOrderDto = new OrderServiceFeignClient.OrderDto(
            sampleTrackingStatus.getOrderId(),
            sampleTrackingStatus.getOrderNumber(),
            UUID.randomUUID(),
            sampleTrackingStatus.getStatus().name(),
            sampleTrackingStatus.getUpdatedAt(),
            null
        );
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(consistentOrderDto);
        when(customerServiceClient.getCustomerById(any())).thenReturn(sampleCustomerDto);

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, false);

        // Assert
        assertNotNull(result);
        assertEquals(OrderStatusEnum.PENDING, result.getStatus());
        assertEquals(ORDER_NUMBER, result.getOrderNumber());
        
        // Verify that the order service was called to check consistency
        verify(orderServiceClient, times(1)).getOrderByOrderNumber(ORDER_NUMBER);
        
        // Since the data was consistent, no additional cache update should be performed
        // (updateTrackingStatus method calls hasKey internally)
        verify(redisTemplate, atLeast(1)).hasKey(CACHE_KEY);
        verify(valueOperations, times(1)).get(CACHE_KEY);
    }

    @Test
    void testGetTrackingStatus_CacheHitInconsistent_UpdatesCacheAndReturnsNewData() {
        // Arrange
        when(redisTemplate.hasKey(anyString())).thenReturn(true);
        when(valueOperations.get(CACHE_KEY)).thenReturn(sampleTrackingStatus);
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(sampleOrderDto);
        when(customerServiceClient.getCustomerById(any())).thenReturn(sampleCustomerDto);

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, false);

        // Assert
        assertNotNull(result);
        assertEquals(OrderStatusEnum.SHIPPED, result.getStatus()); // Should return the updated status
        assertEquals(ORDER_NUMBER, result.getOrderNumber());
        
        // Verify cache was updated with new data
        verify(redisTemplate, atLeast(1)).hasKey(anyString());
        verify(valueOperations, times(1)).get(CACHE_KEY);
        verify(valueOperations, times(1)).set(eq(CACHE_KEY), any(TrackingStatus.class), anyLong(), any());
    }

    @Test
    void testGetTrackingStatus_ForceRefresh_SkipsCacheAndReturnsLatestData() {
        // Arrange
        when(redisTemplate.hasKey(anyString())).thenReturn(true); // Allow hasKey calls from updateTrackingStatus
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(sampleOrderDto);
        when(customerServiceClient.getCustomerById(any())).thenReturn(sampleCustomerDto);

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, true);

        // Assert
        assertNotNull(result);
        assertEquals(OrderStatusEnum.SHIPPED, result.getStatus());
        assertEquals(ORDER_NUMBER, result.getOrderNumber());
        
        // Verify cache lookup for getting was skipped but data was saved to cache
        verify(valueOperations, never()).get(CACHE_KEY);
        verify(valueOperations, times(1)).set(eq(CACHE_KEY), any(TrackingStatus.class), anyLong(), any());
    }

    @Test
    void testGetTrackingStatus_OrderNotFound_ReturnsNull() {
        // Arrange
        when(redisTemplate.hasKey(CACHE_KEY)).thenReturn(false);
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(null);

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, false);

        // Assert
        assertNull(result);
        
        // Verify no cache operations were performed
        verify(valueOperations, never()).set(any(), any(), anyLong(), any());
    }

    @Test
    void testGetTrackingStatus_CacheMiss_LoadsFromOrderServiceAndCaches() {
        // Arrange
        when(redisTemplate.hasKey(CACHE_KEY)).thenReturn(false);
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(sampleOrderDto);
        when(customerServiceClient.getCustomerById(any())).thenReturn(sampleCustomerDto);

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, false);

        // Assert
        assertNotNull(result);
        assertEquals(OrderStatusEnum.SHIPPED, result.getStatus());
        assertEquals(ORDER_NUMBER, result.getOrderNumber());
        
        // Verify data was cached
        verify(valueOperations, times(1)).set(eq(CACHE_KEY), any(TrackingStatus.class), anyLong(), any());
    }

    @Test
    void testGetTrackingStatus_ObsoleteCacheData_RemovesObsoleteData() {
        // Arrange
        when(redisTemplate.hasKey(CACHE_KEY)).thenReturn(true);
        when(valueOperations.get(CACHE_KEY)).thenReturn(sampleTrackingStatus);
        when(orderServiceClient.getOrderByOrderNumber(ORDER_NUMBER)).thenReturn(null); // Order no longer exists

        // Act
        TrackingStatus result = trackingService.getTrackingStatus(ORDER_NUMBER, false);

        // Assert
        assertNull(result);
        
        // Verify obsolete cache data was removed
        verify(redisTemplate, times(1)).delete(CACHE_KEY);
    }

    @Test
    void testUpdateTrackingStatus_UpdatesCache() {
        // Act
        trackingService.updateTrackingStatus(sampleTrackingStatus);

        // Assert
        verify(valueOperations, times(1)).set(eq(CACHE_KEY), eq(sampleTrackingStatus), eq(1L), any());
    }
}
