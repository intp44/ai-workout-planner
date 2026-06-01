package com.aiwalkout.inbody;

import java.time.LocalDate;

public class InBodyUpdateRequest {
    private LocalDate recordDate;
    private Double bodyFatPercent;
    private Double muscleMassKg;
    private Double bmi;
    private Integer basalMetabolicRate;
    private Integer visceralFatLevel;
    private String notes;

    // Getters and Setters
    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Double getBodyFatPercent() {
        return bodyFatPercent;
    }

    public void setBodyFatPercent(Double bodyFatPercent) {
        this.bodyFatPercent = bodyFatPercent;
    }

    public Double getMuscleMassKg() {
        return muscleMassKg;
    }

    public void setMuscleMassKg(Double muscleMassKg) {
        this.muscleMassKg = muscleMassKg;
    }

    public Double getBmi() {
        return bmi;
    }

    public void setBmi(Double bmi) {
        this.bmi = bmi;
    }

    public Integer getBasalMetabolicRate() {
        return basalMetabolicRate;
    }

    public void setBasalMetabolicRate(Integer basalMetabolicRate) {
        this.basalMetabolicRate = basalMetabolicRate;
    }

    public Integer getVisceralFatLevel() {
        return visceralFatLevel;
    }

    public void setVisceralFatLevel(Integer visceralFatLevel) {
        this.visceralFatLevel = visceralFatLevel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
