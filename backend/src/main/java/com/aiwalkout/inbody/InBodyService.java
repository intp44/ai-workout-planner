package com.aiwalkout.inbody;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InBodyService {
    private final InBodyRepository inBodyRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String apiUrl;

    public InBodyService(InBodyRepository inBodyRepository,
                         @Value("${gemini.api.key}") String apiKey,
                         @Value("${gemini.api.url}") String apiUrl,
                         ObjectMapper objectMapper) {
        this.inBodyRepository = inBodyRepository;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    @SuppressWarnings("unchecked")
    public InBodyExtractedData extractInBodyDataFromImage(byte[] imageData, String mimeType) {
        String base64Image = Base64.getEncoder().encodeToString(imageData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "당신은 인바디 측정 결과 사진을 분석하는 전문가입니다. " +
                "다음 이미지에서 체지방률(%), 근육량(kg), BMI, 기초대사량(kcal), 내장지방 수치를 추출하세요. " +
                "정확한 숫자만 추출하고, 다음의 JSON 형식으로 정확히 응답하세요: " +
                "{\"bodyFatPercent\": 25.5, \"muscleMassKg\": 45.2, \"bmi\": 24.5, \"basalMetabolicRate\": 1600, \"visceralFatLevel\": 8} " +
                "숫자를 찾을 수 없으면 null을 입력하세요. 응답은 JSON만 포함하세요.";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
                Map.of("parts", List.of(
                        Map.of("text", prompt),
                        Map.of("inlineData", Map.of(
                                "mimeType", mimeType,
                                "data", base64Image
                        ))
                ))
        ));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 200
        ));

        URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("key", apiKey)
                .build()
                .toUri();

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(uri, request, Map.class);
            System.out.println("Gemini Vision 응답: " + response);

            if (response == null) {
                throw new IllegalStateException("Gemini API 응답이 없습니다.");
            }

            String extractedText = extractTextFromResponse(response);
            System.out.println("추출된 텍스트: " + extractedText);

            return parseInBodyData(extractedText);
        } catch (Exception e) {
            System.err.println("Gemini Vision API 호출 오류: " + e.getMessage());
            throw new RuntimeException("이미지 분석 실패: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        Object candidatesObj = response.get("candidates");
        if (!(candidatesObj instanceof List)) {
            throw new IllegalStateException("Gemini API 형식이 올바르지 않습니다.");
        }

        List<?> candidates = (List<?>) candidatesObj;
        if (candidates.isEmpty()) {
            throw new IllegalStateException("Gemini API candidates가 없습니다.");
        }

        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> contentMap = (Map<?, ?>) firstCandidate.get("content");
        List<?> parts = (List<?>) contentMap.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        Object text = firstPart.get("text");
        if (!(text instanceof String)) {
            throw new IllegalStateException("Gemini API 텍스트가 없습니다.");
        }

        return (String) text;
    }

    private InBodyExtractedData parseInBodyData(String jsonText) {
        try {
            // JSON 문자열을 파싱합니다 (마크다운 코드 블록 제거)
            String cleanJson = jsonText.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            Map<String, Object> data = objectMapper.readValue(cleanJson, Map.class);

            InBodyExtractedData extracted = new InBodyExtractedData();
            extracted.setBodyFatPercent(parseDouble(data.get("bodyFatPercent")));
            extracted.setMuscleMassKg(parseDouble(data.get("muscleMassKg")));
            extracted.setBmi(parseDouble(data.get("bmi")));
            extracted.setBasalMetabolicRate(parseInteger(data.get("basalMetabolicRate")));
            extracted.setVisceralFatLevel(parseInteger(data.get("visceralFatLevel")));

            return extracted;
        } catch (Exception e) {
            System.err.println("JSON 파싱 오류: " + e.getMessage());
            throw new RuntimeException("데이터 파싱 실패: " + e.getMessage());
        }
    }

    private Double parseDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    @Transactional
    public InBodyResponse saveInBodyRecord(String userId, InBodyUpdateRequest request) {
        InBodyRecord record = new InBodyRecord();
        record.setUserId(userId);
        record.setRecordDate(request.getRecordDate() != null ? request.getRecordDate() : LocalDate.now());
        record.setBodyFatPercent(request.getBodyFatPercent());
        record.setMuscleMassKg(request.getMuscleMassKg());
        record.setBmi(request.getBmi());
        record.setBasalMetabolicRate(request.getBasalMetabolicRate());
        record.setVisceralFatLevel(request.getVisceralFatLevel());
        record.setNotes(request.getNotes());

        InBodyRecord saved = inBodyRepository.save(record);
        return new InBodyResponse(saved);
    }

    @Transactional
    public InBodyResponse updateInBodyRecord(Long recordId, InBodyUpdateRequest request) {
        InBodyRecord record = inBodyRepository.findById(recordId)
                .orElseThrow(() -> new IllegalStateException("인바디 기록을 찾을 수 없습니다."));

        if (request.getRecordDate() != null) {
            record.setRecordDate(request.getRecordDate());
        }
        if (request.getBodyFatPercent() != null) {
            record.setBodyFatPercent(request.getBodyFatPercent());
        }
        if (request.getMuscleMassKg() != null) {
            record.setMuscleMassKg(request.getMuscleMassKg());
        }
        if (request.getBmi() != null) {
            record.setBmi(request.getBmi());
        }
        if (request.getBasalMetabolicRate() != null) {
            record.setBasalMetabolicRate(request.getBasalMetabolicRate());
        }
        if (request.getVisceralFatLevel() != null) {
            record.setVisceralFatLevel(request.getVisceralFatLevel());
        }
        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        InBodyRecord updated = inBodyRepository.save(record);
        return new InBodyResponse(updated);
    }

    public InBodyResponse getLatestInBodyRecord(String userId) {
        return inBodyRepository.findFirstByUserIdOrderByRecordDateDesc(userId)
                .map(InBodyResponse::new)
                .orElse(null);
    }

    public List<InBodyResponse> getInBodyRecordHistory(String userId) {
        return inBodyRepository.findByUserIdOrderByRecordDateDesc(userId)
                .stream()
                .map(InBodyResponse::new)
                .toList();
    }
}
