package com.zeroOneBlog.Services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.zeroOneBlog.Dto.ReportDto;
import com.zeroOneBlog.Entities.Comment;
import com.zeroOneBlog.Entities.Post;
import com.zeroOneBlog.Entities.Report;
import com.zeroOneBlog.Entities.User;
import com.zeroOneBlog.Repositories.CommentRepository;
import com.zeroOneBlog.Repositories.PostRepository;
import com.zeroOneBlog.Repositories.ReportRepository;
import com.zeroOneBlog.Repositories.UserRepository;
import com.zeroOneBlog.Types.StatusTypes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public Report createReport(User reporter,ReportDto reqReport) {
        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(reqReport.getReason());
        report.setReportType(reqReport.getReportType());
        report.setStatus(StatusTypes.PENDING);

        switch (reqReport.getReportType()) {
            case POST:
                Post post = postRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new RuntimeException("Post not found"));
                report.setPost(post);
                break;
            case COMMENT:
                Comment comment = commentRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new RuntimeException("Comment not found"));
                report.setComment(comment);
                break;
            case USER:
                User user = userRepository.findById(reqReport.getTargetId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                report.setTarget(user);
                break;
            default:
                throw new RuntimeException("Invalid report type");
        }

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }
    
    public List<Report> getReportsByStatus(StatusTypes status) {
        if (status == null || status == StatusTypes.ALL) {
            return reportRepository.findAll();
        }
        return reportRepository.findByStatus(status);
    }

    public Report updateReportStatus(UUID id, StatusTypes status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        return reportRepository.save(report);
    }

    public void deleteReport(UUID id) {
        reportRepository.deleteById(id);
    }
}
