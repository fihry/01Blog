import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NotificationService, Notification } from "../../../core/services/notification.service"

@Component({
  selector: "app-notification-list",
  standalone: true,
  imports: [CommonModule],
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
    } else if (this.activeFilter === 'mentions') {
      return this.notifications.filter(n => n.type === 'mention')
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
}