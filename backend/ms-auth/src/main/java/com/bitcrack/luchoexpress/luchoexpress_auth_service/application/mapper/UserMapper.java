package com.bitcrack.luchoexpress.luchoexpress_auth_service.application.mapper;

import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto.CreateUserRequest;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto.RegisterRequest;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.application.dto.UserResponse;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.RoleEnum;
import com.bitcrack.luchoexpress.luchoexpress_auth_service.domain.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public User toEntity(RegisterRequest request, String encodedPassword) {
        return new User(
            request.getUsername(),
            encodedPassword,
            request.getEmail(),
            RoleEnum.USER // Default role for registration
        );
    }
    
    public User toEntity(CreateUserRequest request, String encodedPassword) {
        return new User(
            request.getUsername(),
            encodedPassword,
            request.getEmail(),
            request.getRole()
        );
    }
    
    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled(),
            user.getCreatedAt()
        );
    }
}
