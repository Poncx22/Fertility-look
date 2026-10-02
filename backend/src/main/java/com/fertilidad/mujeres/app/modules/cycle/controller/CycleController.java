package com.fertilidad.mujeres.app.modules.cycle.controller;

import com.fertilidad.mujeres.app.modules.cycle.dto.CalculationRequestDTO;
import com.fertilidad.mujeres.app.modules.cycle.dto.CycleResponseDTO;
import com.fertilidad.mujeres.app.modules.cycle.service.CycleCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cycle")
@RequiredArgsConstructor
public class CycleController {

    private final CycleCalculationService service;

    @PostMapping("/calculate")
    public ResponseEntity<CycleResponseDTO> calculate(@Valid @RequestBody CalculationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.calculateAndSaveCycle(request));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<CycleResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CycleResponseDTO>> history(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(service.getHistory(userId));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
