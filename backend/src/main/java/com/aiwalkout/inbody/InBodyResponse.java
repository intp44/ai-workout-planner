package com.aiwalkout.inbody;

import java.time.LocalDate;

public class InBodyResponse {
    private Long id;
    private LocalDate recordDate;
    private Double bodyFatPercent;
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
}
