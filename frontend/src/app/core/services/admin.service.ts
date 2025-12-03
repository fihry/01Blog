import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"

export interface AdminStats {
  total_users: number
  total_posts: number
  total_reports: number
  pending_reports: number
}

export interface AdminReport {
  id: number
  reporter_id: number
  target_id: number
  type: string
  reason: string
  status: string
  created_at: string
  reporter?: { username: string; avatar_url?: string }
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "http://localhost:8000/api/admin"

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`)
  }

  getReports(status?: string): Observable<AdminReport[]> {
    const url = status ? `${this.apiUrl}/reports?status=${status}` : `${this.apiUrl}/reports`
    return this.http.get<AdminReport[]>(url)
  }

  updateReportStatus(id: number, status: string): Observable<AdminReport> {
    return this.http.put<AdminReport>(`${this.apiUrl}/reports/${id}`, { status })
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`)
  }

  banUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/ban`, {})
  }

  getUsers(page = 0, limit = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users?page=${page}&limit=${limit}`)
  }
}
