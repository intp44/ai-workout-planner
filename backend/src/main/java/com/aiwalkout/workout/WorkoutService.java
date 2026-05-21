package com.aiwalkout.workout;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkoutService {
    private final WorkoutRecordRepository workoutRecordRepository;

    public WorkoutService(WorkoutRecordRepository workoutRecordRepository) {
        this.workoutRecordRepository = workoutRecordRepository;
    }

    @Transactional
    public WorkoutRecordResponse saveWorkout(String userId, WorkoutRecordRequest request) {
        WorkoutRecord record = new WorkoutRecord();
        record.setUserId(userId);
        record.setExerciseName(request.getExerciseName());
        record.setSets(request.getSets());
        record.setWeightKg(request.getWeightKg());
        record.setReps(request.getReps());
        record.setWorkoutDate(request.getWorkoutDate());
        return new WorkoutRecordResponse(workoutRecordRepository.save(record));
    }

    public List<WorkoutRecordResponse> getMyWorkouts(String userId) {
        return workoutRecordRepository.findByUserIdOrderByWorkoutDateDesc(userId).stream()
                .map(WorkoutRecordResponse::new)
                .collect(Collectors.toList());
    }

    public WorkoutStatsResponse getWorkoutStats(String userId) {
        LocalDate now = LocalDate.now();
        LocalDate weeklyStart = now.minusDays(6);
        LocalDate monthlyStart = now.minusDays(29);

        List<WorkoutRecord> weeklyRecords = workoutRecordRepository.findByUserIdAndWorkoutDateBetweenOrderByWorkoutDateAsc(userId, weeklyStart, now);
        List<WorkoutRecord> monthlyRecords = workoutRecordRepository.findByUserIdAndWorkoutDateBetweenOrderByWorkoutDateAsc(userId, monthlyStart, now);

        List<WorkoutStatsResponse.DailyWorkoutStat> weeklyStats = weeklyStart.datesUntil(now.plusDays(1))
                .map(date -> new WorkoutStatsResponse.DailyWorkoutStat(
                        date.toString(),
                        (int) weeklyRecords.stream().filter(record -> record.getWorkoutDate().equals(date)).count()
                ))
                .collect(Collectors.toList());

        Map<String, List<WorkoutRecord>> groupedByExercise = monthlyRecords.stream()
                .collect(Collectors.groupingBy(WorkoutRecord::getExerciseName));

        List<WorkoutStatsResponse.ExerciseWeightTrend> exerciseWeightTrends = groupedByExercise.entrySet().stream()
                .map(entry -> new WorkoutStatsResponse.ExerciseWeightTrend(
                        entry.getKey(),
                        entry.getValue().stream()
                                .sorted(Comparator.comparing(WorkoutRecord::getWorkoutDate))
                                .map(record -> new WorkoutStatsResponse.WeightEntry(record.getWorkoutDate().toString(), record.getWeightKg()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new WorkoutStatsResponse(weeklyStats, exerciseWeightTrends);
    }
}
