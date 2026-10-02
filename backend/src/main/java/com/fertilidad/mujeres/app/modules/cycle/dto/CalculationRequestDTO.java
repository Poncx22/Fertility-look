package com.fertilidad.mujeres.app.modules.cycle.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculationRequestDTO {

    @NotNull(message = "lastPeriodDate es obligatorio (yyyy-MM-dd)")
    private LocalDate lastPeriodDate;

    @Min(value = 21, message = "cycleLength mínimo 21 días")
    @Max(value = 45, message = "cycleLength máximo 45 días")
    private int cycleLength;

    @Min(value = 2, message = "periodLength mínimo 2 días")
    @Max(value = 10, message = "periodLength máximo 10 días")
    private int periodLength;

    // Opcional: si se envía, el registro queda asociado a la usuaria.
    // Si es null, se guarda sin relación (compatible con el plan original).
    private Long userId;
}
