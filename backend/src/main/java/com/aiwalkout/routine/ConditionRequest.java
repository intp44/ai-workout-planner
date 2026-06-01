package com.aiwalkout.routine;

import java.util.List;

public class ConditionRequest {
    private String conditionLevel; // "good", "medium", "bad"
    private List<String> tiredAreas; // ["upper_body", "lower_body", "shoulder", "arm", "back", "chest", "leg"]
    private String notes;

    public ConditionRequest() {}

    public ConditionRequest(String conditionLevel, List<String> tiredAreas) {
        this.conditionLevel = conditionLevel;
        this.tiredAreas = tiredAreas;
    }

    public String getConditionLevel() {
        return conditionLevel;
    }

    public void setConditionLevel(String conditionLevel) {
        this.conditionLevel = conditionLevel;
    }

    public List<String> getTiredAreas() {
        return tiredAreas;
    }

    public void setTiredAreas(List<String> tiredAreas) {
        this.tiredAreas = tiredAreas;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
