import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

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
              <p class="text-3xl font-bold text-primary m-0">1,234</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Total Posts</p>
              <p class="text-3xl font-bold text-primary m-0">5,678</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Reports</p>
              <p class="text-3xl font-bold text-danger m-0">42</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="app-widget-card p-4 h-100">
              <p class="text-muted-foreground text-sm m-0">Banned Users</p>
              <p class="text-3xl font-bold text-warning m-0">18</p>
            </div>
          </div>
        </div>

        <div class="app-widget-card p-5 shadow-sm">
          <h2 class="text-xl font-bold text-foreground mb-4">Recent Reports</h2>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-content-between align-items-center p-3 bg-accent rounded-3">
              <span class="text-foreground font-medium">Inappropriate Content Report</span>
              <span class="badge bg-danger">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent { }
