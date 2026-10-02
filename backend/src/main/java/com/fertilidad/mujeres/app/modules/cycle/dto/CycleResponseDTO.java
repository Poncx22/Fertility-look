package com.fertilidad.mujeres.app.modules.cycle.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CycleResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private LocalDate lastPeriodStart;
    private LocalDate nextPeriodStart;
    private LocalDate estimatedOvulationDate;
    private LocalDate fertileWindowStart;
    private LocalDate fertileWindowEnd;
    private List<LocalDate> periodDays;
    private List<LocalDate> fertileDays;
    private List<LocalDate> nonFertileDays;
}
