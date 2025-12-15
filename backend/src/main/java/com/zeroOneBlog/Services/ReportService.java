package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zeroOneBlog.Dto.ReportDto;
import com.zeroOneBlog.Dto.UserSummaryDto;
import com.zeroOneBlog.Entities.Comment;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.Report;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.ReportRepository;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.StatusTypes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public ReportDto createReport(User reporter, ReportDto reqReport) {
        log.info("Creating report by user: {}", reporter.getUsername());
        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(reqReport.getReason());
        report.setReportType(reqReport.getReportType());
        report.setStatus(StatusTypes.PENDING);

        switch (reqReport.getReportType()) {
            case POST:
                Post post = postRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
                report.setPost(post);
                break;
            case COMMENT:
                Comment comment = commentRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
                report.setComment(comment);
                break;
            case USER:
                User user = userRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
                report.setTarget(user);
                break;
            default:
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid report type");
        }

        Report savedReport = reportRepository.save(report);
        return mapToDto(savedReport);
    }

    @Transactional(readOnly = true)
    public List<ReportDto> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDto> getReportsByStatus(StatusTypes status) {
        if (status == null || status == StatusTypes.ALL) {
            return getAllReports();
        }
        return reportRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReportDto updateReportStatus(UUID id, StatusTypes status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus(status);
        Report updatedReport = reportRepository.save(report);
        return mapToDto(updatedReport);
    }

    public void deleteReport(UUID id) {
        if (!reportRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Report not found");
        }
        reportRepository.deleteById(id);
    }

    private ReportDto mapToDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        
        User reporter = report.getReporter();
        if (reporter != null) {
             dto.setReporter(new UserSummaryDto(reporter.getId(), reporter.getUsername(), reporter.getAvatarUrl()));
        }

        dto.setReportType(report.getReportType());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());

        if (report.getPost() != null) {
            dto.setTargetId(report.getPost().getId());
        } else if (report.getComment() != null) {
            dto.setTargetId(report.getComment().getId());
        } else if (report.getTarget() != null) {
            dto.setTargetId(report.getTarget().getId());
        }

        return dto;
    }
}

