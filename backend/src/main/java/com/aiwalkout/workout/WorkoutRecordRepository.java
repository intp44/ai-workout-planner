package com.aiwalkout.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutRecordRepository extends JpaRepository<WorkoutRecord, Long> {
    List<WorkoutRecord> findByUserIdOrderByWorkoutDateDesc(String userId);
    List<WorkoutRecord> findByUserIdAndWorkoutDateBetweenOrderByWorkoutDateAsc(String userId, LocalDate startDate, LocalDate endDate);
}
