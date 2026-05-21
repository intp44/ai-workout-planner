package com.aiwalkout.survey;

public class SurveyResponse {
    private Long id;
    private Integer age;
    private String gender;
    private Integer heightCm;
    private Integer weightKg;
    private String goal;
    private String experienceLevel;
    private String equipment;

    public SurveyResponse() {
    }

    public SurveyResponse(Survey survey) {
        this.id = survey.getId();
        this.age = survey.getAge();
        this.gender = survey.getGender();
        this.heightCm = survey.getHeightCm();
        this.weightKg = survey.getWeightKg();
        this.goal = survey.getGoal();
        this.experienceLevel = survey.getExperienceLevel();
        this.equipment = survey.getEquipment();
    }

    public Long getId() {
        return id;
    }

    public Integer getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public Integer getWeightKg() {
        return weightKg;
    }

    public String getGoal() {
        return goal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public String getEquipment() {
        return equipment;
    }
}
