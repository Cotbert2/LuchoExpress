package main.java.com.bitcrack.luchoexpresstracking.trancking_service_lucho_express.infrastructure.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
public class ApiKeyInterceptor implements RequestInterceptor {

    @Value("${microservices.api-key}")
    private String apiKey;

    @Override
    public void apply(RequestTemplate template) {
        // Agregar API Key a todas las peticiones de Feign
        template.header("X-API-Key", apiKey);
        log.debug("Added API Key header to Feign request: {}", template.url());
    }
}
