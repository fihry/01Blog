import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"

export interface User {
  id: string
  username: string
  email: string
  bio: string
  avatarUrl?: string
  createdAt: string
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing?: boolean
}

interface UpdateProfileRequest {
  username?: string
  bio?: string
  avatar?: File
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = "http://localhost:8000/api/users"

  constructor(private http: HttpClient) { }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  getUserPosts(id: string, page = 0, limit = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/posts?page=${page}&limit=${limit}`)
  }

  getUsers(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${limit}`)
  }

  updateProfile(id: string, data: UpdateProfileRequest): Observable<User> {
    const formData = new FormData()
    if (data.username) formData.append("username", data.username)
    if (data.bio) formData.append("bio", data.bio)
    if (data.avatar) formData.append("avatar", data.avatar)
    return this.http.put<User>(`${this.apiUrl}/${id}`, formData)
  }

  followUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/follow`, {})
  }

  unfollowUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/follow`)
  }

  getFollowers(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/followers`)
  }

  getFollowing(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/following`)
  }
}
