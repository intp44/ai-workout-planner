package com.aiwalkout.inbody;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InBodyRepository extends JpaRepository<InBodyRecord, Long> {
    Optional<InBodyRecord> findFirstByUserIdOrderByRecordDateDesc(String userId);
    List<InBodyRecord> findByUserIdOrderByRecordDateDesc(String userId);
}
