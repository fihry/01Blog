import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { AdminService, AdminReport } from "../../../core/services/admin.service";
import { PostService, Post } from "../../../core/services/post.service";
import { ReportService } from "../../../core/services/report.service";
import { User } from "../../../core/services/user.service";

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
    private postService: PostService,
    private reportService: ReportService,
    private router: Router
  ) { }

  ngOnInit() {
    this.adminService.getStats().subscribe(s => {
      this.statsCards[0].value = s.total_users;
      this.statsCards[1].value = s.total_posts;
      this.statsCards[2].value = s.total_reports;
      this.statsCards[3].value = s.pending_reports;
    });

    this.adminService.getUsers(0, 50).subscribe(p => this.users = p.content);
    this.postService.getFeed().subscribe(p => this.posts = p.content);
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

  deleteUser(id: string) {
    if (confirm('Delete user?'))
      this.adminService.deleteUser(id).subscribe(() =>
        this.users = this.users.filter(u => u.id !== id));
  }

  deletePost(id: string) {
    if (confirm('Delete post?'))
      this.adminService.deletePost(id).subscribe(() =>
        this.posts = this.posts.filter(p => p.id !== id));
  }

  updateReport(id: string, status: 'REVIEWED' | 'RESOLVED') {
    this.adminService.updateReportStatus(id, status).subscribe({
      next: (updatedReport) => {
        this.reports = this.reports.filter(r => r.id !== id);
        // Optional: you could re-fetch or keep it if you want to show it in the filtered list
      },
      error: (err) => console.error("Failed to update report", err)
    });
  }

  deleteReport(id: string) {
    if (confirm('Delete report?'))
      this.reportService.deleteReport(id).subscribe(() =>
        this.reports = this.reports.filter(r => r.id !== id));
  }
}
