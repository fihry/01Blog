import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NotificationService } from "../../../core/services/notification.service"

@Component({
  selector: "app-notification-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto py-8 px-4">
      <h1 class="text-3xl font-bold text-white mb-6">Notifications</h1>

      <div class="space-y-4">
        <div *ngFor="let notification of notifications" class="bg-slate-900 rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition">
          <div class="flex gap-4">
            <div class="flex-1">
              <p class="text-white font-semibold">{{ notification.title }}</p>
              <p class="text-gray-400 text-sm">{{ notification.message }}</p>
              <p class="text-gray-500 text-xs mt-2">{{ notification.createdAt | date }}</p>
            </div>
            <button 
              *ngIf="!notification.read"
              (click)="markAsRead(notification.id)"
              class="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition text-sm"
            >
              Mark Read
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationListComponent implements OnInit {
  notifications: any[] = []

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications
    })
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    })
  }
}
