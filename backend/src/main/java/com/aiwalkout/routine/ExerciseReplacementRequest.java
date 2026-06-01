package com.aiwalkout.routine;

public class ExerciseReplacementRequest {
    private String day;
    private String exerciseName;
    private String focus;
    private String replacementType; // "no_equipment" or "no_space"

    public ExerciseReplacementRequest() {}

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public String getFocus() {
        return focus;
    }

    public void setFocus(String focus) {
        this.focus = focus;
    }

    public String getReplacementType() {
        return replacementType;
    }

    public void setReplacementType(String replacementType) {
        this.replacementType = replacementType;
    }
}
