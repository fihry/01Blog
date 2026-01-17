import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable } from "rxjs"
import { tap } from "rxjs/operators"
import { environment } from "../../../environments/environment"

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
  isOwner?: boolean
}

export interface PostPage {
  content: Post[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CreatePostRequest {
  title: string
  content: string
  media?: File[]
}

@Injectable({
  providedIn: "root",
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`
  private postsSubject = new BehaviorSubject<Post[]>([])
  public posts$ = this.postsSubject.asObservable()

  constructor(private http: HttpClient) { }

  getFeed(page = 0, size = 10): Observable<PostPage> {
    return this.http.get<PostPage>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      tap((pageResp) => {
        const currentPosts = this.postsSubject.value
        this.postsSubject.next([...currentPosts, ...pageResp.content])
      })
    )
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    const formData = new FormData()
    const postPayload = {
      title: data.title,
      content: data.content,
    }
    formData.append(
      "post",
      new Blob([JSON.stringify(postPayload)], { type: "application/json" }),
    )
    if (data.media) {
      data.media.forEach((file) => formData.append("media", file))
    }
    return this.http.post<Post>(`${this.apiUrl}`, formData)
  }

  updatePost(id: string, data: Partial<CreatePostRequest>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data)
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  likePost(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {})
  }

  unlikePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/like`)
  }
}
