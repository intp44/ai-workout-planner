package com.aiwalkout.routine;

import java.util.List;

public class RoutineResponse {
    private Long id;
    private String title;
    private String description;
    private Object routine;
    private String tip;
    private String conditionLevel;
    private List<String> tiredAreas;

    public RoutineResponse() {
    }

    public RoutineResponse(Long id, String title, String description, Object routine, String tip) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.routine = routine;
        this.tip = tip;
    }

    public RoutineResponse(Long id, String title, String description, Object routine, String tip, 
                          String conditionLevel, List<String> tiredAreas) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.routine = routine;
        this.tip = tip;
        this.conditionLevel = conditionLevel;
        this.tiredAreas = tiredAreas;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Object getRoutine() {
        return routine;
    }

    public String getTip() {
        return tip;
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
}
