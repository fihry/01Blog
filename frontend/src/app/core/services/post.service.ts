import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable } from "rxjs"
import { tap } from "rxjs/operators"

export interface Post {
  id: number
  user_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    username: string
    avatar_url?: string
  }
  media?: Array<{
    id: number
    media_url: string
    media_type: string
  }>
  likes_count: number
  comments_count: number
  liked_by_user?: boolean
}

interface CreatePostRequest {
  title: string
  content: string
  media?: File[]
}

@Injectable({
  providedIn: "root",
})
export class PostService {
  private apiUrl = "http://localhost:8000/api/posts"
  private postsSubject = new BehaviorSubject<Post[]>([])
  public posts$ = this.postsSubject.asObservable()

  constructor(private http: HttpClient) {}

  getFeed(page = 0, limit = 10): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/feed?page=${page}&limit=${limit}`).pipe(
      tap((posts) => {
        const currentPosts = this.postsSubject.value
        this.postsSubject.next([...currentPosts, ...posts])
      }),
    )
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", data.content)
    if (data.media) {
      data.media.forEach((file) => formData.append("media", file))
    }
    return this.http.post<Post>(`${this.apiUrl}`, formData)
  }

  updatePost(id: number, data: Partial<CreatePostRequest>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data)
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  likePost(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {})
  }

  unlikePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/like`)
  }
}
