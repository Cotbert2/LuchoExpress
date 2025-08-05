package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.config;

import feign.RequestInterceptor;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.clients")
public class FeignConfig {
    
    @Bean
    public RequestInterceptor apiKeyInterceptor() {
        return new ApiKeyInterceptor();
    }
}
