package com.bitcrack.luchoexpress.luchoexpress_auth_service.presentation;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto.*;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
// @CrossOrigin disabled when using API Gateway - CORS is handled at gateway level
/*
@CrossOrigin(
    origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = {"Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"},
    allowCredentials = "true"
)
*/
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/token")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse response = userService.getCurrentUser(authentication);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<List<UserResponse>> getAllUsers(Authentication authentication) {
        List<UserResponse> users = userService.getAllUsers(authentication);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id, Authentication authentication) {
        UserResponse user = userService.getUserById(id, authentication);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROOT')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request, Authentication authentication) {
        UserResponse response = userService.createUser(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PatchMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication) {
        UserResponse user = userService.updateUser(id, request, authentication);
        return ResponseEntity.ok(user);
    }
    
    @PatchMapping("/users/{id}/disable")
    public ResponseEntity<Void> disableUser(@PathVariable UUID id, Authentication authentication) {
        userService.disableUser(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
