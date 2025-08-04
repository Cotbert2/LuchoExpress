package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.UUID;

@FeignClient(name = "customer-service", url = "${customer.service.url:http://localhost:8082}")
public interface CustomerServiceFeignClient {

    @GetMapping("/api/customers/{customerId}")
    CustomerDto getCustomerById(@PathVariable UUID customerId);

    record CustomerDto(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
