package com.aiwalkout.youtube;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/youtube")
public class YoutubeController {

    @Value("${youtube.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, String>>> search(@RequestParam String q) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/search")
                .queryParam("part", "snippet")
                .queryParam("type", "video")
                .queryParam("maxResults", 3)
                .queryParam("q", q + " 운동 방법 사용법")
                .queryParam("key", apiKey)
                .build()
                .toUriString();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            List<Map<String, String>> result = new ArrayList<>();

            if (items != null) {
                for (Map<String, Object> item : items) {
                    Map<String, Object> id = (Map<String, Object>) item.get("id");
                    Map<String, Object> snippet = (Map<String, Object>) item.get("snippet");
                    Map<String, Object> thumbnails = (Map<String, Object>) snippet.get("thumbnails");
                    Map<String, Object> medium = (Map<String, Object>) thumbnails.get("medium");

                    String videoId = (String) id.get("videoId");
                    String title = (String) snippet.get("title");
                    String thumbnail = (String) medium.get("url");

                    result.add(Map.of("videoId", videoId, "title", title, "thumbnail", thumbnail));
                }
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
