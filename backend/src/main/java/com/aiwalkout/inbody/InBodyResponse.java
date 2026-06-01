package com.aiwalkout.inbody;

import java.time.LocalDate;

public class InBodyResponse {
    private Long id;
    private LocalDate recordDate;
    private Double bodyFatPercent;
<<<<<<< HEAD
    private Double muscleMassKg;
    private Double bmi;
    private Integer basalMetabolicRate;
    private Integer visceralFatLevel;
    private String notes;

    public InBodyResponse(InBodyRecord record) {
        this.id = record.getId();
        this.recordDate = record.getRecordDate();
        this.bodyFatPercent = record.getBodyFatPercent();
        this.muscleMassKg = record.getMuscleMassKg();
        this.bmi = record.getBmi();
        this.basalMetabolicRate = record.getBasalMetabolicRate();
        this.visceralFatLevel = record.getVisceralFatLevel();
        this.notes = record.getNotes();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
=======
    private Double muscleMass;
    private Double weightKg;

    public static InBodyResponse from(InBodyRecord r) {
        InBodyResponse res = new InBodyResponse();
        res.id = r.getId();
        res.recordDate = r.getRecordDate();
        res.bodyFatPercent = r.getBodyFatPercent();
        res.muscleMass = r.getMuscleMass();
        res.weightKg = r.getWeightKg();
        return res;
    }

    public Long getId() { return id; }
    public LocalDate getRecordDate() { return recordDate; }
    public Double getBodyFatPercent() { return bodyFatPercent; }
    public Double getMuscleMass() { return muscleMass; }
    public Double getWeightKg() { return weightKg; }
>>>>>>> origin/main
}
