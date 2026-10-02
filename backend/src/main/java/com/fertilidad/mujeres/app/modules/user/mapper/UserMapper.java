package com.fertilidad.mujeres.app.modules.user.mapper;

import com.fertilidad.mujeres.app.modules.user.dto.UserCreateDTO;
import com.fertilidad.mujeres.app.modules.user.dto.UserResponseDTO;
import com.fertilidad.mujeres.app.modules.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserCreateDTO dto) {
        String email = dto.getEmail() == null || dto.getEmail().isBlank()
                ? null
                : dto.getEmail().trim().toLowerCase();
        return User.builder()
                .name(dto.getName().trim())
                .email(email)
                .build();
    }

    public UserResponseDTO toDTO(User entity) {
        return UserResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
