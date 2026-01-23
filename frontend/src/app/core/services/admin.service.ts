import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { Post, PostPage } from "./post.service"

export interface AdminStats {
  total_users: number
  total_posts: number
  total_reports: number
  pending_reports: number
}

export interface AdminReport {
  id: string
  reporter: { id: string; username: string; avatarUrl?: string }
  targetId: string
  reportType: "POST" | "USER" | "COMMENT"
  reason: string
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED"
  createdAt: string
}

import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`

  constructor(private http: HttpClient) { }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`)
  }

  getReports(status: string = "PENDING"): Observable<AdminReport[]> {
    return this.http.get<AdminReport[]>(`${environment.apiUrl}/admin/reports/${status}`)
  }

  updateReportStatus(id: string, status: string): Observable<AdminReport> {
    return this.http.put<AdminReport>(`${environment.apiUrl}/admin/reports/${id}/status`, { status })
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`)
  }

  banUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/ban`, {})
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`)
  }

  getUsers(page = 0, limit = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users?page=${page}&limit=${limit}`)
  }
}
