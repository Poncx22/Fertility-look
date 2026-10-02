package com.fertilidad.mujeres.app.modules.cycle.repository;

import com.fertilidad.mujeres.app.modules.cycle.entity.CycleRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CycleRepository extends JpaRepository<CycleRecord, Long> {

    @EntityGraph(attributePaths = "user")
    List<CycleRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Disocia el historial de la usuaria (user_id → NULL) para conservarlo al eliminarla. */
    @Modifying
    @Query("UPDATE CycleRecord c SET c.user = null WHERE c.user.id = :userId")
    void disassociateByUserId(@Param("userId") Long userId);

    @Override
    @EntityGraph(attributePaths = "user")
    List<CycleRecord> findAll();

    @Override
    @EntityGraph(attributePaths = "user")
    Optional<CycleRecord> findById(Long id);
}
