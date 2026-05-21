package com.aiwalkout.workout;

import java.util.List;

public class WorkoutStatsResponse {
    private List<DailyWorkoutStat> weeklyStats;
    private List<ExerciseWeightTrend> exerciseWeightTrends;

    public WorkoutStatsResponse() {
    }

    public WorkoutStatsResponse(List<DailyWorkoutStat> weeklyStats, List<ExerciseWeightTrend> exerciseWeightTrends) {
        this.weeklyStats = weeklyStats;
        this.exerciseWeightTrends = exerciseWeightTrends;
    }

    public List<DailyWorkoutStat> getWeeklyStats() {
        return weeklyStats;
    }

    public List<ExerciseWeightTrend> getExerciseWeightTrends() {
        return exerciseWeightTrends;
    }

    public static class DailyWorkoutStat {
        private String date;
        private int count;

        public DailyWorkoutStat() {
        }

        public DailyWorkoutStat(String date, int count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() {
            return date;
        }

        public int getCount() {
            return count;
        }
    }

    public static class ExerciseWeightTrend {
        private String exerciseName;
        private List<WeightEntry> entries;

        public ExerciseWeightTrend() {
        }

        public ExerciseWeightTrend(String exerciseName, List<WeightEntry> entries) {
            this.exerciseName = exerciseName;
            this.entries = entries;
        }

        public String getExerciseName() {
            return exerciseName;
        }

        public List<WeightEntry> getEntries() {
            return entries;
        }
    }

    public static class WeightEntry {
        private String date;
        private Double weightKg;

        public WeightEntry() {
        }

        public WeightEntry(String date, Double weightKg) {
            this.date = date;
            this.weightKg = weightKg;
        }

        public String getDate() {
            return date;
        }

        public Double getWeightKg() {
            return weightKg;
        }
    }
}
