import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950">
      <div class="max-w-7xl mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <p class="text-slate-400 text-sm">Total Users</p>
            <p class="text-3xl font-bold text-cyan-400">1,234</p>
          </div>
          <div class="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <p class="text-slate-400 text-sm">Total Posts</p>
            <p class="text-3xl font-bold text-cyan-400">5,678</p>
          </div>
          <div class="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <p class="text-slate-400 text-sm">Reports</p>
            <p class="text-3xl font-bold text-red-400">42</p>
          </div>
          <div class="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <p class="text-slate-400 text-sm">Banned Users</p>
            <p class="text-3xl font-bold text-yellow-400">18</p>
          </div>
        </div>

        <div class="bg-slate-900 rounded-lg shadow-xl p-6 border border-slate-800">
          <h2 class="text-xl font-bold text-white mb-4">Recent Reports</h2>
          <div class="space-y-2">
            <div class="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span class="text-slate-300">Inappropriate Content Report</span>
              <span class="text-red-400 text-sm">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {}
