package com.aiwalkout.routine;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/routine")
public class RoutineController {
    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<RoutineResponse> recommendRoutine(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        try {
            RoutineResponse response = routineService.createRoutineFromSurvey(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @PostMapping("/replacement")
    public ResponseEntity<ExerciseReplacementResponse> recommendExerciseReplacement(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ExerciseReplacementRequest request) {
        String userId = jwt.getSubject();
        try {
            ExerciseReplacementResponse response = routineService.recommendExerciseReplacement(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @PostMapping("/recommend/with-condition")
    public ResponseEntity<RoutineResponse> recommendRoutineWithCondition(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ConditionRequest condition) {
        String userId = jwt.getSubject();
        try {
            RoutineResponse response = routineService.createRoutineWithCondition(userId, condition);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<RoutineResponse> getMyLatestRoutine(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        RoutineResponse response = routineService.getLatestRoutine(userId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }
}
