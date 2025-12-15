package com.zeroOneBlog.Controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Dto.ReportDto;
import com.zeroOneBlog.Entities.Report;
import com.zeroOneBlog.Security.CustomUserDetails;
import com.zeroOneBlog.Services.ReportService;
import com.zeroOneBlog.Types.StatusTypes;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/report")
    public ResponseEntity<Report> createReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ReportDto request) {
        Report report = reportService.createReport(userDetails.getUser(),request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/admin/reports/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports(@PathVariable StatusTypes status) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status)); 
    }    

    // @GetMapping("/admin/reports/pending")
    // @PreAuthorize("hasRole('ADMIN')")
    // public ResponseEntity<List<Report>> getReportsByStatus( ) {
    //     return ResponseEntity.ok(reportService.getReportsByStatus());
    // }

    @DeleteMapping("/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}
