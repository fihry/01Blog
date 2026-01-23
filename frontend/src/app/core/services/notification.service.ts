import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, interval } from "rxjs"
import { tap, switchMap } from "rxjs/operators"

export interface Notification {
  id: number
  user_id: number
  type: "like" | "comment" | "follow" | "mention"
  message: string
  read: boolean
  created_at: string
  author?: {
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
  private testNotifications: Notification[] = [
    {
      id: 1,
      user_id: 123,
      type: "like",
      message: "liked your post about Web Development",
      read: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      author: {
        id: 456,
        username: "Sarah Chen",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      }
    },
    {
      id: 2,
      user_id: 123,
      type: "follow",
      message: "started following you",
      read: false,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      author: {
        id: 457,
        username: "Alex Rodriguez",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      }
    },
    {
      id: 3,
      user_id: 123,
      type: "comment",
      message: "commented on your post: 'Great insights on Angular!'",
      read: true,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      author: {
        id: 458,
        username: "Jordan Smith",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan"
      }
    },
    {
      id: 4,
      user_id: 123,
      type: "mention",
      message: "mentioned you in a comment",
      read: true,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      author: {
        id: 459,
        username: "Taylor Brown",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor"
      }
    },
    {
      id: 5,
      user_id: 123,
      type: "like",
      message: "liked your comment",
      read: false,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      author: {
        id: 460,
        username: "Morgan Lee",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan"
      }
    },
    {
      id: 6,
      user_id: 123,
      type: "mention",
      message: "mentioned you in a post about TypeScript",
      read: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      author: {
        id: 461,
        username: "Casey Johnson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey"
      }
    },
    {
      id: 7,
      user_id: 123,
      type: "comment",
      message: "replied to your comment: 'I totally agree with your point!'",
      read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      author: {
        id: 462,
        username: "Jamie Wilson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie"
      }
    },
    {
      id: 8,
      user_id: 123,
      type: "follow",
      message: "started following you",
      read: true,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      author: {
        id: 463,
        username: "Drew Martinez",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Drew"
      }
    },
    {
      id: 9,
      user_id: 123,
      type: "like",
      message: "liked your post about RxJS Operators",
      read: false,
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      author: {
        id: 464,
        username: "Riley Garcia",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley"
      }
    },
    {
      id: 10,
      user_id: 123,
      type: "mention",
      message: "tagged you in a discussion about best practices",
      read: false,
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      author: {
        id: 465,
        username: "Avery Thompson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Avery"
      }
    }
  ];
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
      // Use test data if API returns null/undefined
     const finalNotifications = (notifications && notifications.length > 0) 
     ? notifications 
     : this.testNotifications
      
      this.notificationsSubject.next(finalNotifications);
      console.log(finalNotifications);
      
      const unreadCount = finalNotifications.filter((n) => !n.read).length;
      this.unreadCountSubject.next(unreadCount);
    }),
  );
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
