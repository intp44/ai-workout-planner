package com.aiwalkout.inbody;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InBodyRepository extends JpaRepository<InBodyRecord, Long> {
    List<InBodyRecord> findByUserIdOrderByRecordDateAsc(String userId);
}
