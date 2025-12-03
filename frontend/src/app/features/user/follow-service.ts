import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class FollowService {
  private followings = new BehaviorSubject<Set<number>>(
    new Set([2, 3, 5]), // User is following users with IDs 2, 3, 5
  )

  constructor() {}

  isFollowing(userId: number): Observable<boolean> {
    return new Observable((observer) => {
      this.followings.subscribe((followList) => {
        observer.next(followList.has(userId))
      })
    })
  }

  toggleFollow(userId: number) {
    const current = new Set(this.followings.value)
    if (current.has(userId)) {
      current.delete(userId)
    } else {
      current.add(userId)
    }
    this.followings.next(current)
  }

  getFollowingCount(): Observable<number> {
    return new Observable((observer) => {
      this.followings.subscribe((followList) => {
        observer.next(followList.size)
      })
    })
  }
}
