package com.fertilidad.mujeres.app.modules.cycle.entity;

import com.fertilidad.mujeres.app.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cycle_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CycleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "last_period_date", nullable = false)
    private LocalDate lastPeriodDate;

    @Column(name = "cycle_length", nullable = false)
    private int cycleLength;

    @Column(name = "period_length", nullable = false)
    private int periodLength;

    @Column(name = "next_period_date", nullable = false)
    private LocalDate nextPeriodDate;

    @Column(name = "ovulation_date", nullable = false)
    private LocalDate ovulationDate;

    @Column(name = "fertile_start", nullable = false)
    private LocalDate fertileStart;

    @Column(name = "fertile_end", nullable = false)
    private LocalDate fertileEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
