package com.aiwalkout.routine;

import java.util.List;
import java.util.Map;

public class ExerciseReplacementResponse {
    private List<Map<String, Object>> replacements;
    private String fallback;

    public ExerciseReplacementResponse() {}

    public ExerciseReplacementResponse(List<Map<String, Object>> replacements, String fallback) {
        this.replacements = replacements;
        this.fallback = fallback;
    }

    public List<Map<String, Object>> getReplacements() {
        return replacements;
    }

    public void setReplacements(List<Map<String, Object>> replacements) {
        this.replacements = replacements;
    }

    public String getFallback() {
        return fallback;
    }

    public void setFallback(String fallback) {
        this.fallback = fallback;
    }
}
