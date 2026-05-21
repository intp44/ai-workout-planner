package com.aiwalkout.routine;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
    Optional<Routine> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
