package com.aiwalkout.routine;

public class RoutineResponse {
    private Long id;
    private String title;
    private String description;
    private Object routine;
    private String tip;

    public RoutineResponse() {
    }

    public RoutineResponse(Long id, String title, String description, Object routine, String tip) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.routine = routine;
        this.tip = tip;
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
}
