package com.fertilidad.mujeres.app.modules.user.service.impl;

import com.fertilidad.mujeres.app.modules.cycle.repository.CycleRepository;
import com.fertilidad.mujeres.app.modules.user.dto.UserCreateDTO;
import com.fertilidad.mujeres.app.modules.user.dto.UserResponseDTO;
import com.fertilidad.mujeres.app.modules.user.dto.UserUpdateDTO;
import com.fertilidad.mujeres.app.modules.user.entity.User;
import com.fertilidad.mujeres.app.modules.user.exception.EmailAlreadyExistsException;
import com.fertilidad.mujeres.app.modules.user.mapper.UserMapper;
import com.fertilidad.mujeres.app.modules.user.repository.UserRepository;
import com.fertilidad.mujeres.app.modules.user.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CycleRepository cycleRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserCreateDTO dto) {
        String email = dto.getEmail() == null || dto.getEmail().isBlank()
                ? null
                : dto.getEmail().trim().toLowerCase();
        if (email != null && userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }
        User saved = userRepository.save(userMapper.toEntity(dto));
        return userMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User no encontrado con id: " + id));
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User no encontrado con id: " + id));

        String email = dto.getEmail() == null || dto.getEmail().isBlank()
                ? null
                : dto.getEmail().trim().toLowerCase();
        if (email != null) {
            userRepository.findByEmail(email)
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new EmailAlreadyExistsException(email);
                    });
        }

        user.setName(dto.getName().trim());
        user.setEmail(email);
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User no encontrado con id: " + id));
        // Conserva su historial: lo disocia (user_id → NULL) en vez de borrarlo.
        cycleRepository.disassociateByUserId(id);
        userRepository.delete(user);
    }
}
