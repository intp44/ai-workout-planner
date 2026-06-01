package com.aiwalkout.inbody;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InBodyRequest {

    @NotNull
    private LocalDate recordDate;
    private Double bodyFatPercent;
    private Double muscleMass;
    private Double weightKg;

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    public Double getBodyFatPercent() { return bodyFatPercent; }
    public void setBodyFatPercent(Double bodyFatPercent) { this.bodyFatPercent = bodyFatPercent; }
    public Double getMuscleMass() { return muscleMass; }
    public void setMuscleMass(Double muscleMass) { this.muscleMass = muscleMass; }
    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
}
