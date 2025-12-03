import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

export interface Notification {
  id: number
  type: "like" | "comment" | "follow" | "mention"
  actor: string
  actorAvatar: string
  message: string
  read: boolean
  timestamp: string
  relatedPostId?: number
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([
    {
      id: 1,
      type: "like",
      actor: "Sarah Chen",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      message: "liked your post about Web Development",
      read: false,
      timestamp: "5m ago",
      relatedPostId: 1,
    },
    {
      id: 2,
      type: "follow",
      actor: "Alex Rodriguez",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      message: "started following you",
      read: false,
      timestamp: "1h ago",
    },
    {
      id: 3,
      type: "comment",
      actor: "Jordan Smith",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      message: "commented on your post",
      read: true,
      timestamp: "3h ago",
      relatedPostId: 2,
    },
    {
      id: 4,
      type: "mention",
      actor: "Taylor Brown",
      actorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
      message: "mentioned you in a comment",
      read: true,
      timestamp: "5h ago",
      relatedPostId: 3,
    },
  ])

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable()
  }

  markAsRead(notificationId: number) {
    const current = this.notifications.value
    const updated = current.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    this.notifications.next(updated)
  }

  markAllAsRead() {
    const current = this.notifications.value
    const updated = current.map((n) => ({ ...n, read: true }))
    this.notifications.next(updated)
  }

  getUnreadCount(): Observable<number> {
    return new Observable((observer) => {
      this.notifications.subscribe((notifs) => {
        observer.next(notifs.filter((n) => !n.read).length)
      })
    })
  }

  deleteNotification(notificationId: number) {
    const current = this.notifications.value
    const updated = current.filter((n) => n.id !== notificationId)
    this.notifications.next(updated)
  }
}
