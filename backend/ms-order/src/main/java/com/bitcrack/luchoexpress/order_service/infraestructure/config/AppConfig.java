package com.bitcrack.luchoexpress.order_service.infraestructure.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
@EnableFeignClients(basePackages = "com.bitcrack.luchoexpress.order_service.infraestructure.clients")
public class AppConfig {
    
}
