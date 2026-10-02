package com.fertilidad.mujeres.app.modules.user.service;

import com.fertilidad.mujeres.app.modules.user.dto.UserCreateDTO;
import com.fertilidad.mujeres.app.modules.user.dto.UserResponseDTO;
import com.fertilidad.mujeres.app.modules.user.dto.UserUpdateDTO;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(UserCreateDTO dto);

    List<UserResponseDTO> findAllUsers();

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, UserUpdateDTO dto);

    void deleteUser(Long id);
}
