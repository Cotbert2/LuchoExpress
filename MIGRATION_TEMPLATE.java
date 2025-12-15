// TEMPLATE para migrar CUALQUIER microservicio a OAuth2 Resource Server
// Solo cambia: 
// 1. package name
// 2. requestMatchers (endpoints específicos del servicio)
// 3. hasRole/hasAnyRole según la lógica del servicio

package com.bitcrack.luchoexpress.NOMBRE_SERVICIO.infraestructure.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    @Value("${jwt.secret:mySecretKey}")
    private String jwtSecret;
    
    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/actuator/**").permitAll()
                // TODO: Configurar endpoints específicos de cada servicio aquí
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter)
                )
            )
            .build();
    }
    
    @Bean
    public JwtDecoder jwtDecoder() {
        // Use HS512 to match ms-auth service
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512");
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }
}

// JwtAuthenticationConverter.java (IGUAL para todos los servicios)
@Component
public class JwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {
    
    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return new JwtAuthenticationToken(jwt, authorities);
    }
    
    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        String role = jwt.getClaimAsString("role");
        if (role != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + role));
        }
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
