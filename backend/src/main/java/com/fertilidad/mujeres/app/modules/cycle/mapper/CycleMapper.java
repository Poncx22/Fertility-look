package com.fertilidad.mujeres.app.modules.cycle.mapper;

import com.fertilidad.mujeres.app.modules.cycle.dto.CalculationRequestDTO;
import com.fertilidad.mujeres.app.modules.cycle.dto.CycleResponseDTO;
import com.fertilidad.mujeres.app.modules.cycle.entity.CycleRecord;
import com.fertilidad.mujeres.app.modules.user.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class CycleMapper {

    public CycleRecord toEntity(CalculationRequestDTO request,
                                LocalDate nextPeriod,
                                LocalDate ovulation,
                                LocalDate fertileStart,
                                LocalDate fertileEnd,
                                User user) {
        return CycleRecord.builder()
                .lastPeriodDate(request.getLastPeriodDate())
                .cycleLength(request.getCycleLength())
                .periodLength(request.getPeriodLength())
                .nextPeriodDate(nextPeriod)
                .ovulationDate(ovulation)
                .fertileStart(fertileStart)
                .fertileEnd(fertileEnd)
                .user(user)
                .build();
    }

    public CycleResponseDTO toDTO(CycleRecord entity,
                                  List<LocalDate> periodDays,
                                  List<LocalDate> fertileDays,
                                  List<LocalDate> nonFertileDays) {
        return CycleResponseDTO.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userName(entity.getUser() != null ? entity.getUser().getName() : null)
                .lastPeriodStart(entity.getLastPeriodDate())
                .nextPeriodStart(entity.getNextPeriodDate())
                .estimatedOvulationDate(entity.getOvulationDate())
                .fertileWindowStart(entity.getFertileStart())
                .fertileWindowEnd(entity.getFertileEnd())
                .periodDays(periodDays)
                .fertileDays(fertileDays)
                .nonFertileDays(nonFertileDays)
                .build();
    }
}
