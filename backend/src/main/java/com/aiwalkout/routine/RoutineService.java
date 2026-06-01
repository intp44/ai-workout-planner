package com.aiwalkout.routine;

import com.aiwalkout.inbody.InBodyService;
import com.aiwalkout.inbody.InBodyResponse;
import com.aiwalkout.security.GeminiService;
import com.aiwalkout.survey.Survey;
import com.aiwalkout.survey.SurveyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class RoutineService {
    private final RoutineRepository routineRepository;
    private final SurveyService surveyService;
    private final GeminiService geminiService;
    private final InBodyService inBodyService;
    private final ObjectMapper objectMapper;

    public RoutineService(RoutineRepository routineRepository,
                          SurveyService surveyService,
                          GeminiService geminiService,
                          InBodyService inBodyService,
                          ObjectMapper objectMapper) {
        this.routineRepository = routineRepository;
        this.surveyService = surveyService;
        this.geminiService = geminiService;
        this.inBodyService = inBodyService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RoutineResponse createRoutineFromSurvey(String userId) {
        Survey survey = surveyService.getSurveyByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("설문 데이터가 필요합니다."));
        String prompt = buildPrompt(survey, null);
        Map<String, Object> content = geminiService.requestRoutine(prompt);
        Routine routine = new Routine();
        routine.setUserId(userId);
        routine.setTitle("AI 맞춤형 루틴");
        routine.setDescription("설문 데이터를 기반으로 생성된 맞춤형 운동 루틴입니다.");
        routine.setAiPayload(asJsonString(content));
        routine.setRecommendedDate(Instant.now());
        Routine saved = routineRepository.save(routine);
        return toRoutineResponse(saved, content);
    }

    @Transactional
    public RoutineResponse createRoutineWithCondition(String userId, ConditionRequest condition) {
        Survey survey = surveyService.getSurveyByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("설문 데이터가 필요합니다."));
        String prompt = buildPrompt(survey, condition);
        Map<String, Object> content = geminiService.requestRoutine(prompt);
        Routine routine = new Routine();
        routine.setUserId(userId);
        routine.setTitle("AI 맞춤형 루틴");
        routine.setDescription("설문 데이터와 현재 컨디션을 기반으로 생성된 맞춤형 운동 루틴입니다.");
        routine.setAiPayload(asJsonString(content));
        routine.setRecommendedDate(Instant.now());
        Routine saved = routineRepository.save(routine);
        RoutineResponse response = toRoutineResponse(saved, content);
        response.setConditionLevel(condition.getConditionLevel());
        response.setTiredAreas(condition.getTiredAreas());
        return response;
    }

    private String buildPrompt(Survey survey, ConditionRequest condition) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("당신은 한국 사용자에게 맞춤형 운동 루틴을 만드는 AI 트레이너입니다. " +
                "아래 정보를 바탕으로 4~5일 분량의 주간 루틴을 JSON으로 출력하세요. " +
                "JSON 형식은 반드시 다음과 같아야 합니다: {\"routine\":[{\"day\":\"월요일\",\"focus\":\"가슴/삼두\",\"exercises\":[{\"name\":\"벤치프레스\",\"sets\":4,\"reps\":\"8-10\",\"rest\":\"90초\"}]}],\"tip\":\"오늘의 조언\"}. " +
                "응답은 오직 JSON 형식으로만 반환하고, 추가 설명을 포함하지 마세요. ");

        promptBuilder.append(String.format(
                "사용자 정보: 나이 %d세, 성별 %s, 키 %dcm, 몸무게 %dkg, 목표 %s, 운동 경험 %s, 기구 %s. ",
                survey.getAge(),
                survey.getGender(),
                survey.getHeightCm(),
                survey.getWeightKg(),
                mapGoalToText(survey.getGoal()),
                mapExperienceToText(survey.getExperienceLevel()),
                mapEquipmentToText(survey.getEquipment())
        ));

        InBodyResponse latestInBody = inBodyService.getLatestInBodyRecord(survey.getUserId());
        if (latestInBody != null) {
            promptBuilder.append(String.format(
                    "최근 인바디 측정 결과: 체지방률 %.1f%%, 근육량 %.1fkg, BMI %.1f, 기초대사량 %d kcal. ",
                    latestInBody.getBodyFatPercent() != null ? latestInBody.getBodyFatPercent() : 0,
                    latestInBody.getMuscleMassKg() != null ? latestInBody.getMuscleMassKg() : 0,
                    latestInBody.getBmi() != null ? latestInBody.getBmi() : 0,
                    latestInBody.getBasalMetabolicRate() != null ? latestInBody.getBasalMetabolicRate() : 0
            ));
        }

        if (condition != null) {
            String conditionText = mapConditionToText(condition.getConditionLevel());
            promptBuilder.append(String.format("현재 신체 컨디션: %s. ", conditionText));
            if (condition.getTiredAreas() != null && !condition.getTiredAreas().isEmpty()) {
                String tiredAreasText = String.join(", ", mapTiredAreas(condition.getTiredAreas()));
                promptBuilder.append(String.format("피로한 부위: %s. ", tiredAreasText));
                promptBuilder.append("이 부위들은 가볍게 자극하거나 완전히 제외하세요. ");
            }
            if ("bad".equals(condition.getConditionLevel())) {
                promptBuilder.append("컨디션이 나쁘므로 오늘은 가벼운 스트레칭과 회복 운동 위주로 구성하세요. ");
            } else if ("medium".equals(condition.getConditionLevel())) {
                promptBuilder.append("일반적인 강도의 루틴을 제공하되, 피로한 부위를 배려하세요. ");
            }
        }

        return promptBuilder.toString();
    }

    private String mapConditionToText(String condition) {
        return switch (condition) {
            case "good" -> "좋음 (일반적인 강도의 운동 가능)";
            case "medium" -> "보통 (중간 강도의 운동)";
            case "bad" -> "나쁨 (휴식 권고)";
            default -> condition;
        };
    }

    private List<String> mapTiredAreas(List<String> areas) {
        return areas.stream()
                .map(area -> switch (area) {
                    case "upper_body" -> "상체";
                    case "lower_body" -> "하체";
                    case "shoulder" -> "어깨";
                    case "arm" -> "팔";
                    case "back" -> "등";
                    case "chest" -> "가슴";
                    case "leg" -> "다리";
                    default -> area;
                })
                .toList();
    }

    private String mapGoalToText(String goal) {
        return switch (goal) {
            case "diet" -> "다이어트";
            case "hypertrophy" -> "근비대";
            case "fitness" -> "체력향상";
            default -> goal;
        };
    }

    private String mapExperienceToText(String experienceLevel) {
        return switch (experienceLevel) {
            case "none" -> "없음";
            case "beginner" -> "초보";
            case "intermediate" -> "중급";
            case "advanced" -> "고급";
            default -> experienceLevel;
        };
    }

    private String mapEquipmentToText(String equipment) {
        return switch (equipment) {
            case "gym" -> "헬스장";
            case "home_gym" -> "홈짐";
            case "none" -> "없음";
            default -> equipment;
        };
    }

    private String asJsonString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new IllegalStateException("JSON 변환 실패", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parsePayload(String payload) {
        try {
            return objectMapper.readValue(payload, Map.class);
        } catch (Exception e) {
            throw new IllegalStateException("저장된 루틴 JSON 파싱 실패", e);
        }
    }

    private RoutineResponse toRoutineResponse(Routine routine, Map<String, Object> content) {
        return new RoutineResponse(
                routine.getId(),
                routine.getTitle(),
                routine.getDescription(),
                content.get("routine"),
                String.valueOf(content.get("tip"))
        );
    }

    public RoutineResponse getLatestRoutine(String userId) {
        return routineRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(routine -> toRoutineResponse(routine, parsePayload(routine.getAiPayload())))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ExerciseReplacementResponse recommendExerciseReplacement(String userId, ExerciseReplacementRequest request) {
        Survey survey = surveyService.getSurveyByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("설문 데이터가 필요합니다."));
        String prompt = buildReplacementPrompt(survey, request);
        Map<String, Object> content = geminiService.requestJson(prompt);

        @SuppressWarnings("unchecked")
        java.util.List<java.util.Map<String, Object>> replacements = content.get("replacements") instanceof java.util.List ?
                (java.util.List<java.util.Map<String, Object>>) content.get("replacements") : java.util.List.of();
        String fallback = String.valueOf(content.getOrDefault("fallback", ""));

        return new ExerciseReplacementResponse(replacements, fallback);
    }

    private String buildReplacementPrompt(Survey survey, ExerciseReplacementRequest request) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("당신은 한국 사용자에게 맞춤형 운동 루틴을 제공하는 AI 트레이너입니다. " +
                "다음 기존 운동을 동일 근육군에서 진행할 수 있는 맨몸 대체 운동으로 바꾸어 주세요. " +
                "만약 동일 근육군 맨몸 대체 운동이 적합하지 않다면 스트레칭 또는 인접 근육군 운동도 추천해 주세요. " +
                "응답은 오직 JSON 형식으로만 반환하고 추가 설명은 포함하지 마세요. " +
                "JSON 형식은 반드시 다음과 같아야 합니다: {\"replacements\":[{\"name\":\"푸쉬업\",\"sets\":3,\"reps\":\"12-15\",\"rest\":\"60초\",\"note\":\"기구 없이 가능한 대체 운동\"}],\"fallback\":\"기구 대체가 어려울 때는 스트레칭 또는 인접 근육군 운동을 해보세요.\"}. ");

        promptBuilder.append(String.format(
                "사용자 정보: 나이 %d세, 성별 %s, 키 %dcm, 몸무게 %dkg, 목표 %s, 운동 경험 %s, 현재 기구 %s. ",
                survey.getAge(),
                survey.getGender(),
                survey.getHeightCm(),
                survey.getWeightKg(),
                mapGoalToText(survey.getGoal()),
                mapExperienceToText(survey.getExperienceLevel()),
                mapEquipmentToText(survey.getEquipment())
        ));

        promptBuilder.append(String.format(
                "기존 운동 정보: 요일 %s, 집중 부위 %s, 운동명 %s. ",
                request.getDay(),
                request.getFocus(),
                request.getExerciseName()
        ));
        promptBuilder.append(String.format(
                "대체 유형: %s. ",
                mapReplacementTypeToText(request.getReplacementType())
        ));
        promptBuilder.append("가능한 경우 동일 근육군 맨몸 운동으로 대체하고, 그렇지 않으면 스트레칭 또는 인접 근육군 운동을 제안하세요. ");
        return promptBuilder.toString();
    }

    private String mapReplacementTypeToText(String replacementType) {
        return switch (replacementType) {
            case "no_equipment" -> "기구 없음";
            case "no_space" -> "공간 없음";
            default -> replacementType;
        };
    }
}