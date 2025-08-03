package com.bitcrack.luchoexpress.luchoexpress_auth_service.application.service;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto.*;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.mapper.UserMapper;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.RoleEnum;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.User;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.exceptions.InvalidCredentialsException;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.exceptions.UnauthorizedOperationException;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.exceptions.UserAlreadyExistsException;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.infraestructure.exceptions.UserNotFoundException;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.persistance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public UserResponse register(RegisterRequest request) {
        // Verificar que no exista el usuario
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }
        
        // Crear usuario con rol USER por defecto
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = userMapper.toEntity(request, encodedPassword);
        User savedUser = userRepository.save(user);
        
        return userMapper.toResponse(savedUser);
    }
    
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndEnabled(request.getUsername(), true)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user);
        return new TokenResponse(token, jwtService.getExpirationTime());
    }
    
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Authentication authentication) {
        String username = extractUsernameFromToken(authentication);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        return userMapper.toResponse(user);
    }
    
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(Authentication authentication) {
        User currentUser = getCurrentUserEntity(authentication);
        
        // Solo ADMIN y ROOT pueden listar usuarios
        if (currentUser.getRole() == RoleEnum.USER) {
            throw new UnauthorizedOperationException("Users cannot list other users");
        }
        
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id, Authentication authentication) {
        User currentUser = getCurrentUserEntity(authentication);
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        
        // Verificar permisos
        if (!currentUser.canViewUser(targetUser)) {
            throw new UnauthorizedOperationException("You don't have permission to view this user");
        }
        
        return userMapper.toResponse(targetUser);
    }
    
    public UserResponse createUser(CreateUserRequest request, Authentication authentication) {
        User currentUser = getCurrentUserEntity(authentication);
        
        // Verificar que puede crear el rol solicitado
        if (!currentUser.canCreateRole(request.getRole())) {
            throw new UnauthorizedOperationException("You don't have permission to create users with role: " + request.getRole());
        }
        
        // Verificar que no exista el usuario
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }
        
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = userMapper.toEntity(request, encodedPassword);
        User savedUser = userRepository.save(user);
        
        return userMapper.toResponse(savedUser);
    }
    
    public UserResponse updateUser(UUID id, UpdateUserRequest request, Authentication authentication) {
        User currentUser = getCurrentUserEntity(authentication);
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        
        // Verificar permisos
        if (!currentUser.canModifyUser(targetUser)) {
            throw new UnauthorizedOperationException("You don't have permission to modify this user");
        }
        
        // Solo actualizar contraseña
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            targetUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(targetUser);
        return userMapper.toResponse(updatedUser);
    }
    
    public void disableUser(UUID id, Authentication authentication) {
        User currentUser = getCurrentUserEntity(authentication);
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        
        // Verificar permisos
        if (!currentUser.canDisableUser(targetUser)) {
            throw new UnauthorizedOperationException("You don't have permission to disable this user");
        }
        
        targetUser.disable();
        userRepository.save(targetUser);
    }
    
    private User getCurrentUserEntity(Authentication authentication) {
        String username = extractUsernameFromToken(authentication);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Current user not found: " + username));
    }
    
    private String extractUsernameFromToken(Authentication authentication) {
        if (authentication.getPrincipal() instanceof String username) {
            return username;
        }
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("username");
        }
        if (authentication.getName() != null) {
            return authentication.getName();
        }
        throw new InvalidCredentialsException("Invalid authentication format");
    }
}
