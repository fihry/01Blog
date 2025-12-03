import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, interval } from "rxjs"
import { tap, switchMap } from "rxjs/operators"

export interface Notification {
  id: number
  user_id: number
  type: "like" | "comment" | "follow" | "mention"
  message: string
  read: boolean
  created_at: string
  actor?: {
    id: number
    username: string
    avatar_url?: string
  }
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private apiUrl = "http://localhost:8000/api/notifications"
  private notificationsSubject = new BehaviorSubject<Notification[]>([])
  public notifications$ = this.notificationsSubject.asObservable()
  private unreadCountSubject = new BehaviorSubject<number>(0)
  public unreadCount$ = this.unreadCountSubject.asObservable()

  constructor(private http: HttpClient) {
    this.startPolling()
  }

  private startPolling(): void {
    interval(30000)
      .pipe(switchMap(() => this.getNotifications()))
      .subscribe()
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}`).pipe(
      tap((notifications) => {
        this.notificationsSubject.next(notifications)
        const unreadCount = notifications.filter((n) => !n.read).length
        this.unreadCountSubject.next(unreadCount)
      }),
    )
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map((n) => (n.id === id ? { ...n, read: true } : n))
        this.notificationsSubject.next(notifications)
        const unreadCount = notifications.filter((n) => !n.read).length
        this.unreadCountSubject.next(unreadCount)
      }),
    )
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map((n) => ({ ...n, read: true }))
        this.notificationsSubject.next(notifications)
        this.unreadCountSubject.next(0)
      }),
    )
  }
}
