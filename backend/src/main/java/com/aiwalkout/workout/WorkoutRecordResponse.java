package com.aiwalkout.workout;

import java.time.LocalDate;

public class WorkoutRecordResponse {
    private Long id;
    private String exerciseName;
    private Integer sets;
    private Double weightKg;
    private Integer reps;
    private LocalDate workoutDate;

    public WorkoutRecordResponse() {
    }

    public WorkoutRecordResponse(WorkoutRecord record) {
        this.id = record.getId();
        this.exerciseName = record.getExerciseName();
        this.sets = record.getSets();
        this.weightKg = record.getWeightKg();
        this.reps = record.getReps();
        this.workoutDate = record.getWorkoutDate();
    }

    public Long getId() {
        return id;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public Integer getSets() {
        return sets;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public Integer getReps() {
        return reps;
    }

    public LocalDate getWorkoutDate() {
        return workoutDate;
    }
}
