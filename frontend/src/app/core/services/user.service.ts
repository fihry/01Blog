import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"

export interface User {
  id: number
  username: string
  email: string
  bio: string
  avatar_url?: string
  created_at: string
  posts_count: number
  followers_count: number
  following_count: number
  is_following?: boolean
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

  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  getUserPosts(id: number, page = 0, limit = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/posts?page=${page}&limit=${limit}`)
  }

  updateProfile(id: number, data: UpdateProfileRequest): Observable<User> {
    const formData = new FormData()
    if (data.username) formData.append("username", data.username)
    if (data.bio) formData.append("bio", data.bio)
    if (data.avatar) formData.append("avatar", data.avatar)
    return this.http.put<User>(`${this.apiUrl}/${id}`, formData)
  }

  followUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/follow`, {})
  }

  unfollowUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/follow`)
  }

  getFollowers(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/followers`)
  }

  getFollowing(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/following`)
  }
}
