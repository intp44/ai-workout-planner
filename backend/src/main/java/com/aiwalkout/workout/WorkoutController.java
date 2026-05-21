package com.aiwalkout.workout;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workout")
public class WorkoutController {
    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutRecordResponse> saveWorkout(@AuthenticationPrincipal Jwt jwt,
                                                             @Valid @RequestBody WorkoutRecordRequest request) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(workoutService.saveWorkout(userId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<WorkoutRecordResponse>> getMyWorkouts(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(workoutService.getMyWorkouts(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<WorkoutStatsResponse> getWorkoutStats(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(workoutService.getWorkoutStats(userId));
    }
}
