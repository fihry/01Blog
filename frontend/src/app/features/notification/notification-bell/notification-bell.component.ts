import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap"
import { RouterModule } from "@angular/router"
import { NotificationService, Notification } from "../../../core/services/notification.service"
import { Subject, takeUntil } from "rxjs"

@Component({
  selector: "app-notification-bell",
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterModule],
  templateUrl:"notification-bell.component.html",
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = []
  unreadCount: number = 0
  private destroy$ = new Subject<void>()

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Load notifications initially
    this.notificationService.getNotifications().subscribe()

    // Subscribe to notifications updates
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications
      })

    // Subscribe to unread count updates
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get recentNotifications(): Notification[] {
    // Show only the 5 most recent notifications
    return this.notifications.slice(0, 5)
  }

  handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe()
    }
    // You can add navigation logic here if needed
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe()
  }
  
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
    return `${Math.floor(seconds / 2592000)}mo ago`
  }
}