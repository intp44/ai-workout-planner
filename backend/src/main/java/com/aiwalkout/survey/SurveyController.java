package com.aiwalkout.survey;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/survey")
public class SurveyController {
    private final SurveyService surveyService;

    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    @PostMapping
    public ResponseEntity<SurveyResponse> saveSurvey(@AuthenticationPrincipal Jwt jwt,
                                                     @Valid @RequestBody SurveyRequest request) {
        String userId = jwt.getSubject();
        String provider = jwt.getClaimAsString("provider");
        Survey survey = surveyService.saveSurvey(userId, provider, request);
        return ResponseEntity.ok(new SurveyResponse(survey));
    }

    @PostMapping("/{id}")
    public ResponseEntity<SurveyResponse> saveSurveyWithId(@AuthenticationPrincipal Jwt jwt,
                                                           @Valid @RequestBody SurveyRequest request,
                                                           @PathVariable String id) {
        // id path variable is ignored in favor of the authenticated user.
        String userId = jwt.getSubject();
        String provider = jwt.getClaimAsString("provider");
        Survey survey = surveyService.saveSurvey(userId, provider, request);
        return ResponseEntity.ok(new SurveyResponse(survey));
    }

    @GetMapping("/me")
    public ResponseEntity<SurveyResponse> getMySurvey(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        String provider = jwt.getClaimAsString("provider");
        return surveyService.getSurveyByUserId(userId, provider)
                .map(survey -> ResponseEntity.ok(new SurveyResponse(survey)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
