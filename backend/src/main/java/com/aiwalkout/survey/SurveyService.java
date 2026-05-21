package com.aiwalkout.survey;

import com.aiwalkout.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class SurveyService {
    private final SurveyRepository surveyRepository;
    private final UserService userService;

    public SurveyService(SurveyRepository surveyRepository, UserService userService) {
        this.surveyRepository = surveyRepository;
        this.userService = userService;
    }

    @Transactional
    public Survey saveSurvey(String userId, String provider, SurveyRequest request) {
        String resolvedUserId = resolveUserId(userId, provider);
        Survey survey = surveyRepository.findByUserId(resolvedUserId).orElseGet(Survey::new);
        survey.setUserId(resolvedUserId);
        survey.setAge(request.getAge());
        survey.setGender(request.getGender());
        survey.setHeightCm(request.getHeightCm());
        survey.setWeightKg(request.getWeightKg());
        survey.setGoal(request.getGoal());
        survey.setExperienceLevel(request.getExperienceLevel());
        survey.setEquipment(request.getEquipment());
        return surveyRepository.save(survey);
    }

    public Optional<Survey> getSurveyByUserId(String userId) {
        return getSurveyByUserId(userId, null);
    }

    public Optional<Survey> getSurveyByUserId(String userId, String provider) {
        return surveyRepository.findByUserId(resolveUserId(userId, provider));
    }

    private String resolveUserId(String userId, String provider) {
        if (userId == null) {
            return null;
        }
        if (userService.existsById(userId)) {
            return userId;
        }
        if (provider != null) {
            return userService.findByOauth2ProviderAndOauth2Id(provider, userId)
                    .map(user -> user.getId())
                    .orElse(userId);
        }
        return userId;
    }
}
