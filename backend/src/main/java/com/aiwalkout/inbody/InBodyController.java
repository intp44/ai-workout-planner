package com.aiwalkout.inbody;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbody")
public class InBodyController {
    private final InBodyService inBodyService;

    public InBodyController(InBodyService inBodyService) {
        this.inBodyService = inBodyService;
    }

    @PostMapping
    public ResponseEntity<InBodyResponse> save(@AuthenticationPrincipal Jwt jwt,
                                               @Valid @RequestBody InBodyRequest request) {
        return ResponseEntity.ok(inBodyService.save(jwt.getSubject(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<InBodyResponse>> getMyRecords(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(inBodyService.getMyRecords(jwt.getSubject()));
    }
}
