package com.fertilidad.mujeres.app.modules.cycle.service.impl;

import com.fertilidad.mujeres.app.modules.cycle.dto.CalculationRequestDTO;
import com.fertilidad.mujeres.app.modules.cycle.dto.CycleResponseDTO;
import com.fertilidad.mujeres.app.modules.cycle.entity.CycleRecord;
import com.fertilidad.mujeres.app.modules.cycle.mapper.CycleMapper;
import com.fertilidad.mujeres.app.modules.cycle.repository.CycleRepository;
import com.fertilidad.mujeres.app.modules.cycle.service.CycleCalculationService;
import com.fertilidad.mujeres.app.modules.user.entity.User;
import com.fertilidad.mujeres.app.modules.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CycleCalculationServiceImpl implements CycleCalculationService {

    private final CycleRepository cycleRepository;
    private final UserRepository userRepository;
    private final CycleMapper cycleMapper;

    @Override
    @Transactional
    public CycleResponseDTO calculateAndSaveCycle(CalculationRequestDTO request) {
        LocalDate lastPeriod = request.getLastPeriodDate();

        // 1. Próximo periodo = último + duración del ciclo
        LocalDate nextPeriod = lastPeriod.plusDays(request.getCycleLength());
        // 2. Ovulación = próximo - 14 días
        LocalDate ovulation = nextPeriod.minusDays(14);
        // 3. Ventana fértil = ovulación -5 ... ovulación +1
        LocalDate fertileStart = ovulation.minusDays(5);
        LocalDate fertileEnd = ovulation.plusDays(1);

        // 4. Días de periodo
        List<LocalDate> periodDays = new ArrayList<>();
        for (int i = 0; i < request.getPeriodLength(); i++) {
            periodDays.add(lastPeriod.plusDays(i));
        }

        // 5. Días fértiles (rango inclusivo)
        List<LocalDate> fertileDays = new ArrayList<>();
        for (LocalDate d = fertileStart; !d.isAfter(fertileEnd); d = d.plusDays(1)) {
            fertileDays.add(d);
        }

        // 6. Días no fértiles = días del ciclo actual (lastPeriod .. nextPeriod-1)
        //    excluyendo fértiles y periodo. Conjuntos disjuntos, cubren todo el ciclo.
        Set<LocalDate> fertileSet = new HashSet<>(fertileDays);
        Set<LocalDate> periodSet = new HashSet<>(periodDays);
        List<LocalDate> nonFertileDays = new ArrayList<>();
        for (LocalDate d = lastPeriod; d.isBefore(nextPeriod); d = d.plusDays(1)) {
            if (!fertileSet.contains(d) && !periodSet.contains(d)) {
                nonFertileDays.add(d);
            }
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User no encontrado con id: " + request.getUserId()));
        }

        CycleRecord entity = cycleMapper.toEntity(request, nextPeriod, ovulation, fertileStart, fertileEnd, user);
        CycleRecord saved = cycleRepository.save(entity);

        return cycleMapper.toDTO(saved, periodDays, fertileDays, nonFertileDays);
    }

    @Override
    @Transactional(readOnly = true)
    public CycleResponseDTO getById(Long id) {
        CycleRecord entity = cycleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CycleRecord no encontrado con id: " + id));
        return rebuildDTO(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CycleResponseDTO> getHistory(Long userId) {
        List<CycleRecord> records = (userId != null)
                ? cycleRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : cycleRepository.findAll();
        return records.stream().map(this::rebuildDTO).toList();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!cycleRepository.existsById(id)) {
            throw new EntityNotFoundException("CycleRecord no encontrado con id: " + id);
        }
        cycleRepository.deleteById(id);
    }

    // Reconstruye las listas de días a partir de la entidad persistida
    // (no se guardan como tabla hija para mantener el modelo simple y escalable).
    private CycleResponseDTO rebuildDTO(CycleRecord entity) {
        List<LocalDate> periodDays = new ArrayList<>();
        for (int i = 0; i < entity.getPeriodLength(); i++) {
            periodDays.add(entity.getLastPeriodDate().plusDays(i));
        }
        List<LocalDate> fertileDays = new ArrayList<>();
        for (LocalDate d = entity.getFertileStart(); !d.isAfter(entity.getFertileEnd()); d = d.plusDays(1)) {
            fertileDays.add(d);
        }
        Set<LocalDate> fertileSet = new HashSet<>(fertileDays);
        Set<LocalDate> periodSet = new HashSet<>(periodDays);
        List<LocalDate> nonFertileDays = new ArrayList<>();
        for (LocalDate d = entity.getLastPeriodDate(); d.isBefore(entity.getNextPeriodDate()); d = d.plusDays(1)) {
            if (!fertileSet.contains(d) && !periodSet.contains(d)) {
                nonFertileDays.add(d);
            }
        }
        return cycleMapper.toDTO(entity, periodDays, fertileDays, nonFertileDays);
    }
}
