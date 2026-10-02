package com.fertilidad.mujeres.app.modules.cycle.service;

import com.fertilidad.mujeres.app.modules.cycle.dto.CalculationRequestDTO;
import com.fertilidad.mujeres.app.modules.cycle.dto.CycleResponseDTO;

import java.util.List;

public interface CycleCalculationService {

    CycleResponseDTO calculateAndSaveCycle(CalculationRequestDTO request);

    CycleResponseDTO getById(Long id);

    List<CycleResponseDTO> getHistory(Long userId);

    void deleteById(Long id);
}
