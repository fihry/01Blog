import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable } from "rxjs"
import { tap } from "rxjs/operators"

// Backend DTO shape (matches PostDto from Spring Boot backend)
export interface Post {
  id: string
  title: string
  content: string
  media: Array<{
    id: string
    mediaUrl: string
    mediaType: string
  }>
  author: {
    id: string
    username: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
}

export interface PostPage {
  content: Post[]
  totalElements: number
  totalPages: number
  number: number
  size: number
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

  getFeed(page = 0, size = 10): Observable<PostPage> {
    return this.http.get<PostPage>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      tap((pageResp) => {
        const currentPosts = this.postsSubject.value
        this.postsSubject.next([...currentPosts, ...pageResp.content])
      })
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
