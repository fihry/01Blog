import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable } from "rxjs"

export interface UserSummary {
    id: string
    username: string
    avatarUrl?: string
}

export interface Comment {
    id: string
    postId: string
    author: UserSummary
    content: string
}

export interface CreateCommentRequest {
    postId: string
    content: string
}

@Injectable({
  providedIn: "root",
})
export class CommentService {
    private apiUrl = "http://localhost:8000/api/posts"
    private postsSubject = new BehaviorSubject<Comment[]>([])
    public posts$ = this.postsSubject.asObservable()
    constructor(private http: HttpClient) { }

    createComment(data: CreateCommentRequest): Observable<Comment> {
        return this.http.post<Comment>(`${this.apiUrl}/${data.postId}`, data)
    }

    getComments(postId: string): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`)
    }
}