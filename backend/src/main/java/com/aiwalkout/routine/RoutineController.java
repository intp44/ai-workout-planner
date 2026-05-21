package com.aiwalkout.routine;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    @GetMapping("/me")
    public ResponseEntity<RoutineResponse> getMyLatestRoutine(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        RoutineResponse response = routineService.getLatestRoutine(userId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }
}
