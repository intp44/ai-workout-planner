package com.aiwalkout.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String apiUrl;

    public GeminiService(@Value("${gemini.api.key}") String apiKey,
                         @Value("${gemini.api.url}") String apiUrl,
                         ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> requestRoutine(String prompt) {
        return requestJson(prompt);
    }

    public Map<String, Object> requestJson(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", java.util.List.of(
                Map.of("parts", java.util.List.of(Map.of("text", prompt)))
        ));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 2048
        ));

        URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("key", apiKey)
                .build()
                .toUri();

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(uri, request, Map.class);
        System.out.println("Gemini 응답: " + response);
        if (response == null) {
            throw new IllegalStateException("Gemini API 응답이 없습니다.");
        }

        Object candidatesObj = response.get("candidates");
        if (!(candidatesObj instanceof java.util.List)) {
            throw new IllegalStateException("Gemini API 형식이 올바르지 않습니다.");
        }

        var candidates = (java.util.List<?>) candidatesObj;
        if (candidates.isEmpty()) {
            throw new IllegalStateException("Gemini API candidates가 없습니다.");
        }

        Object firstCandidate = candidates.get(0);
        if (!(firstCandidate instanceof Map)) {
            throw new IllegalStateException("Gemini API candidate 형식이 잘못되었습니다.");
        }

        var firstCandidateMap = (Map<?, ?>) firstCandidate;
        Object contentObj = firstCandidateMap.get("content");
        if (!(contentObj instanceof Map)) {
            throw new IllegalStateException("Gemini API content 형식이 올바르지 않습니다.");
        }

        var contentMap = (Map<?, ?>) contentObj;
        Object partsObj = contentMap.get("parts");
        if (!(partsObj instanceof java.util.List)) {
            throw new IllegalStateException("Gemini API parts 형식이 올바르지 않습니다.");
        }

        var parts = (java.util.List<?>) partsObj;
        if (parts.isEmpty()) {
            throw new IllegalStateException("Gemini API parts가 없습니다.");
        }

        Object firstPart = parts.get(0);
        if (!(firstPart instanceof Map)) {
            throw new IllegalStateException("Gemini API part 형식이 잘못되었습니다.");
        }

        var firstPartMap = (Map<?, ?>) firstPart;
        Object text = firstPartMap.get("text");
        if (!(text instanceof String)) {
            throw new IllegalStateException("Gemini API 텍스트가 없습니다.");
        }

        String sanitizedText = ((String) text)
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(sanitizedText, Map.class);
            return parsed;
        } catch (Exception e) {
            throw new IllegalStateException("Gemini API 텍스트 JSON 파싱 실패", e);
        }

    }
}
