package com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.config;

import com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.security.TrackingAuthFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {

    @Bean
    public FilterRegistrationBean<TrackingAuthFilter> trackingAuthFilterRegistration(
            TrackingAuthFilter trackingAuthFilter) {
        
        FilterRegistrationBean<TrackingAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(trackingAuthFilter);
        registration.addUrlPatterns("/api/tracking/*", "/api/tracking");
        registration.setName("trackingAuthFilter");
        registration.setOrder(3); // Después de otros filtros
        return registration;
    }
}
