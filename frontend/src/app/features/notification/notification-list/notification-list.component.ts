import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NotificationService, Notification } from "../../../core/services/notification.service"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-notification-list",
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl:"./notification-list.component.html"
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] =[]
  activeFilter: 'all' | 'unread' | 'mentions' = 'all'

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe()    
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications
    })
  }

  get filteredNotifications() {
    if (this.activeFilter === 'all') {
      return this.notifications
    } else if (this.activeFilter === 'unread') {
      return this.notifications.filter(n => !n.read)
    }
    return this.notifications
  }

  get hasUnread() {
    return this.notifications.some(n => !n.read)
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe()
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe()
  }
  deleteNotification(notificationId: number) {
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId)
    })
  }
}