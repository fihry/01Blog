import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Comment {
    id: string;
    postId: string;
    content: string;
    author: {
        id: string
        username: string
        avatarUrl?: string
    };
    isOwner: boolean;
    createdAt: string;
    updatedAt: string;
};
export interface CreateCommentRequest {
    content: string;
};

@Injectable({
    providedIn: "root",
})
export class CommentService {
    private apiUrl = "http://localhost:8000/api/posts/";
    constructor(private http: HttpClient) {}
    getComments(postId: string): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}${postId}/comments`);
    }
    createComment(postId: string, data: CreateCommentRequest): Observable<Comment> {
        return this.http.post<Comment>(`${this.apiUrl}${postId}/comments`, data);
    }
    deleteComment(postId: string, commentId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${postId}/comments/${commentId}`);
    }
    updateComment(postId: string, commentId: string, data: CreateCommentRequest): Observable<Comment> {
        return this.http.put<Comment>(`${this.apiUrl}${postId}/comments/${commentId}`, data);
    }
}