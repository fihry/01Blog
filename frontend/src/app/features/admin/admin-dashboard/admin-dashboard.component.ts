import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { AdminService, AdminReport } from "../../../core/services/admin.service";
import { PostService, Post } from "../../../core/services/post.service";
import { ReportService } from "../../../core/services/report.service";
import { User } from "../../../core/services/user.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrl: "./admin-dashboard.component.css"
})
export class AdminDashboardComponent {

  activeTab: 'users' | 'posts' | 'reports' = 'users';
  reportStatus: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED' = 'PENDING';

  users: User[] = [];
  posts: Post[] = [];
  reports: AdminReport[] = [];

  statsCards = [
    { label: 'Total Users', value: 0, color: 'text-primary' },
    { label: 'Total Posts', value: 0, color: 'text-primary' },
    { label: 'Reports', value: 0, color: 'text-destructive' },
    { label: 'Pending Reports', value: 0, color: 'text-warning' },
  ];

  constructor(
    private adminService: AdminService,
    private reportService: ReportService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.adminService.getStats().subscribe(s => {
      this.statsCards[0].value = s.total_users;
      this.statsCards[1].value = s.total_posts;
      this.statsCards[2].value = s.total_reports;
      this.statsCards[3].value = s.pending_reports;
    });

    this.adminService.getUsers().subscribe(p => this.users = p);
    this.adminService.getPosts().subscribe(p => this.posts = p);
    this.adminService.getReports('PENDING').subscribe(r => this.reports = r);
  }

  switchTab(tab: any) { this.activeTab = tab; }

  setReportStatus(status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED') {
    this.reportStatus = status;
    this.adminService.getReports(status).subscribe(r => this.reports = r);
  }

  filteredReports() {
    return this.reports;
  }

  goToUser(id: string) { this.router.navigate(['/profile', id]); }
  goToPost(id: string) { this.router.navigate(['/post', id]); }

  toggleUser(u: User) {
    this.adminService.banUser(u.id).subscribe(() => u.active = !u.active);
  }

  togglePost(p: Post) {
    if (p.visible && !confirm('Are you sure you want to hide this post?')) return;
    if (!p.visible && !confirm('Are you sure you want to unhide this post?')) return;
    this.adminService.hidePost(p.id).subscribe(() => {
      p.visible = !p.visible;
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?'))
      this.adminService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.id !== id);
        this.toastService.showSuccess("Success", "User deleted successfully.");
      });
  }

  deletePost(id: string) {
    if (confirm('Delete post?'))
      this.adminService.deletePost(id).subscribe(() =>
        this.posts = this.posts.filter(p => p.id !== id));
  }

  updateReport(id: string, status: 'REVIEWED' | 'RESOLVED') {
    this.adminService.updateReportStatus(id, status).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== id);
        this.toastService.showSuccess("Success", "Report updated successfully.");
      },
      error: (err) => {
        this.toastService.showError("Error", "Failed to update report.");
        console.error("Failed to update report", err);
      }
    });
  }

  deleteReport(id: string) {
    if (confirm('Delete report?'))
      this.reportService.deleteReport(id).subscribe(() => {
        this.reports = this.reports.filter(r => r.id !== id);
        this.toastService.showSuccess("Success", "Report deleted successfully.");
      });
  }
}
