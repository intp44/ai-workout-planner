package com.aiwalkout.inbody;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InBodyService {
    private final InBodyRepository inBodyRepository;

    public InBodyService(InBodyRepository inBodyRepository) {
        this.inBodyRepository = inBodyRepository;
    }

    public InBodyResponse save(String userId, InBodyRequest request) {
        InBodyRecord record = new InBodyRecord();
        record.setUserId(userId);
        record.setRecordDate(request.getRecordDate());
        record.setBodyFatPercent(request.getBodyFatPercent());
        record.setMuscleMass(request.getMuscleMass());
        record.setWeightKg(request.getWeightKg());
        return InBodyResponse.from(inBodyRepository.save(record));
    }

    public List<InBodyResponse> getMyRecords(String userId) {
        return inBodyRepository.findByUserIdOrderByRecordDateAsc(userId)
                .stream().map(InBodyResponse::from).collect(Collectors.toList());
    }
}
