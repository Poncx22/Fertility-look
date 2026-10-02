package com.fertilidad.mujeres.app.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {

    @NotBlank(message = "name es obligatorio")
    @Size(max = 100, message = "name máximo 100 caracteres")
    private String name;

    @Email(message = "email debe ser válido")
    @Size(max = 150, message = "email máximo 150 caracteres")
    private String email; // Opcional: null cuando la usuaria no lo indica
}
