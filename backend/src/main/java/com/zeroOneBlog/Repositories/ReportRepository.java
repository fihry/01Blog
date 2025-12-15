package com.zeroOneBlog.Repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeroOneBlog.Entities.Report;
import com.zeroOneBlog.Types.StatusTypes;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findAll();
    List<Report> findByStatus(StatusTypes status);
}
