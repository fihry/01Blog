import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-notification-bell",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button class="relative p-2 text-slate-300 hover:text-cyan-500 transition">
        <span class="text-xl">🔔</span>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      
      <div class="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg hidden">
        <div class="p-4 border-b border-slate-700">
          <h3 class="font-bold text-white">Notifications</h3>
        </div>
        <div class="max-h-96 overflow-y-auto">
          <div class="p-4 border-b border-slate-700 hover:bg-slate-700 cursor-pointer">
            <p class="text-white text-sm"><strong>John Doe</strong> liked your post</p>
            <p class="text-slate-400 text-xs mt-1">2 hours ago</p>
          </div>
          <div class="p-4 border-b border-slate-700 hover:bg-slate-700 cursor-pointer">
            <p class="text-white text-sm"><strong>Jane Smith</strong> started following you</p>
            <p class="text-slate-400 text-xs mt-1">5 hours ago</p>
          </div>
          <div class="p-4 hover:bg-slate-700 cursor-pointer">
            <p class="text-white text-sm">New comment on your post</p>
            <p class="text-slate-400 text-xs mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationBellComponent {}
