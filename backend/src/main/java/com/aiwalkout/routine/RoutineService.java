package com.aiwalkout.routine;

import com.aiwalkout.security.GeminiService;
import com.aiwalkout.survey.Survey;
import com.aiwalkout.survey.SurveyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
public class RoutineService {
    private final RoutineRepository routineRepository;
    private final SurveyService surveyService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public RoutineService(RoutineRepository routineRepository,
                          SurveyService surveyService,
                          GeminiService geminiService,
                          ObjectMapper objectMapper) {
        this.routineRepository = routineRepository;
        this.surveyService = surveyService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RoutineResponse createRoutineFromSurvey(String userId) {
        System.out.println("루틴 생성 시작: userId=" + userId);
        Survey survey = surveyService.getSurveyByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("설문 데이터가 필요합니다."));
        System.out.println("설문 조회 완료: age=" + survey.getAge());

        String prompt = buildPrompt(survey);
        System.out.println("프롬프트 생성 완료");
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

    public RoutineResponse getLatestRoutine(String userId) {
        return routineRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(routine -> toRoutineResponse(routine, parsePayload(routine.getAiPayload())))
                .orElse(null);
    }

    private String buildPrompt(Survey survey) {
        return String.format(
                "당신은 한국 사용자에게 맞춤형 운동 루틴을 만드는 AI 트레이너입니다. " +
                        "아래 정보를 바탕으로 4~5일 분량의 주간 루틴을 JSON으로 출력하세요. " +
                        "JSON 형식은 반드시 다음과 같아야 합니다: {\"routine\":[{\"day\":\"월요일\",\"focus\":\"가슴/삼두\",\"exercises\":[{\"name\":\"벤치프레스\",\"sets\":4,\"reps\":\"8-10\",\"rest\":\"90초\"}]}],\"tip\":\"오늘의 조언\"}. " +
                        "응답은 오직 JSON 형식으로만 반환하고, 추가 설명을 포함하지 마세요. " +
                        "사용자 정보: 나이 %d세, 성별 %s, 키 %dcm, 몸무게 %dkg, 목표 %s, 운동 경험 %s, 기구 %s.",
                survey.getAge(),
                survey.getGender(),
                survey.getHeightCm(),
                survey.getWeightKg(),
                mapGoalToText(survey.getGoal()),
                mapExperienceToText(survey.getExperienceLevel()),
                mapEquipmentToText(survey.getEquipment())
        );
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
}
