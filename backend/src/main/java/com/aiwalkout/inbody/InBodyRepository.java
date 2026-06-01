package com.aiwalkout.inbody;

import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InBodyRepository extends JpaRepository<InBodyRecord, Long> {
    Optional<InBodyRecord> findFirstByUserIdOrderByRecordDateDesc(String userId);
    List<InBodyRecord> findByUserIdOrderByRecordDateDesc(String userId);
=======
import java.util.List;

public interface InBodyRepository extends JpaRepository<InBodyRecord, Long> {
    List<InBodyRecord> findByUserIdOrderByRecordDateAsc(String userId);
>>>>>>> origin/main
}
