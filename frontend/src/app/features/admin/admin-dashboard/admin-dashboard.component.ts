import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { AdminService } from "../../../core/services/admin.service"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-xl mx-auto py-5 px-4">
        <h1 class="text-3xl font-bold text-foreground mb-5">Admin Dashboard</h1>

        <div class="row g-4 mb-5">
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Total Users</p>
              <p class="text-3xl font-bold text-primary m-0">{{ stats.total_users }}</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Total Posts</p>
              <p class="text-3xl font-bold text-primary m-0">{{ stats.total_posts }}</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Reports</p>
              <p class="text-3xl font-bold text-danger m-0">{{ stats.total_reports }}</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Pending Reports</p>
              <p class="text-3xl font-bold text-warning m-0">{{ stats.pending_reports }}</p>
            </div>
          </div>
        </div>

        <div class="app-widget-card p-5 shadow-sm">
          <h2 class="text-xl font-bold text-foreground mb-4">Recent Pending Reports</h2>
          <div class="d-flex flex-column gap-2">
            <div *ngFor="let report of recentReports" class="d-flex justify-content-between align-items-center p-3 bg-accent rounded-3">
              <span class="text-foreground font-medium">{{ getReportTitle(report) }}</span>
              <span class="badge bg-warning">{{ report.status }}</span>
            </div>
            <div *ngIf="recentReports.length === 0" class="text-muted">No pending reports</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  stats: any = {
    total_users: 0,
    total_posts: 0,
    total_reports: 0,
    pending_reports: 0
  }
  recentReports: any[] = []

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.getStats().subscribe(data => {
      this.stats = data
    })

    this.adminService.getReports('PENDING').subscribe(data => {
      this.recentReports = data.slice(0, 5) // Show only last 5
    })
  }

  getReportTitle(report: any): string {
    return `${report.reportType} reported for ${report.reason}`
  }
}
