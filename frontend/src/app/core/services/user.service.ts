import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { Post} from "./post.service"
import { environment } from "../../../environments/environment"


export interface User {
  id: string
  username: string
  email: string
  bio: string
  avatarUrl?: string
  role: string
  postsCount: number
  followersCount: number
  followingCount: number
  createdAt: string
  active: boolean
  followed?: boolean
}

interface UpdateProfileRequest {
  bio?: string
  avatar?: File
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`

  constructor(private http: HttpClient) { }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  getUserPosts(id :string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${id}/posts`)
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`)
  }
  getSuggestions(): Observable<any> {
    return this.http.get<User[]>(`${this.apiUrl}/suggestions`)
  }

  updateProfile(id: string, data: UpdateProfileRequest): Observable<User> {
    const formData = new FormData()
    if (data.bio) formData.append("bio", data.bio)
    if (data.avatar) formData.append("avatar", data.avatar)
    return this.http.put<User>(`${this.apiUrl}/${id}`, formData)
  }

  changePassword(id: string, data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/change-password`, data)
  }

  toggleFollow(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/subscribe`, {})
  }

  getFollowers(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/followers`)
  }

  getFollowing(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/following`)
  }
}
