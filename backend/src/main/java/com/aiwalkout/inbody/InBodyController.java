package com.aiwalkout.inbody;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbody")
public class InBodyController {
    private final InBodyService inBodyService;

    public InBodyController(InBodyService inBodyService) {
        this.inBodyService = inBodyService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeInBodyImage(
            @RequestParam("image") MultipartFile imageFile,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            byte[] imageData = imageFile.getBytes();
            String mimeType = imageFile.getContentType();

            if (mimeType == null || (!mimeType.equals("image/jpeg") && !mimeType.equals("image/png"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "JPG 또는 PNG 이미지만 지원됩니다."));
            }

            InBodyExtractedData extractedData = inBodyService.extractInBodyDataFromImage(imageData, mimeType);

            Map<String, Object> response = new HashMap<>();
            response.put("bodyFatPercent", extractedData.getBodyFatPercent());
            response.put("muscleMassKg", extractedData.getMuscleMassKg());
            response.put("bmi", extractedData.getBmi());
            response.put("basalMetabolicRate", extractedData.getBasalMetabolicRate());
            response.put("visceralFatLevel", extractedData.getVisceralFatLevel());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "파일 읽기 실패: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "이미지 분석 중 오류 발생: " + e.getMessage()));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveInBodyRecord(
            @RequestBody InBodyUpdateRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            InBodyResponse response = inBodyService.saveInBodyRecord(userId, request);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "저장 실패: " + e.getMessage()));
        }
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<Map<String, Object>> updateInBodyRecord(
            @PathVariable Long recordId,
            @RequestBody InBodyUpdateRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            InBodyResponse response = inBodyService.updateInBodyRecord(recordId, request);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "수정 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestInBodyRecord(Authentication authentication) {
        try {
            String userId = authentication.getName();
            InBodyResponse response = inBodyService.getLatestInBodyRecord(userId);

            if (response == null) {
                return ResponseEntity.noContent().build();
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "조회 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getInBodyRecordHistory(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<InBodyResponse> records = inBodyService.getInBodyRecordHistory(userId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", records);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "조회 실패: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteInBodyRecord(
            @PathVariable Long recordId,
            Authentication authentication) {
        String userId = authentication.getName();
        inBodyService.deleteInBodyRecord(userId, recordId);
        return ResponseEntity.noContent().build();
    }
}
