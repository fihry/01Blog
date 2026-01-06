import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"

export interface Report {
  id: string
  reporter_id: string
  target_id: string
  type: "post" | "user" | "comment"
  reason: string
  created_at: string
  status: "pending" | "reviewed" | "resolved"
}

interface CreateReportRequest {
  type: "post" | "user" | "comment"
  reason: string
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = "http://localhost:8000/api/reports"

  constructor(private http: HttpClient) { }

  createReport(targetId: string, data: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}`, {
      target_id: targetId,
      ...data,
    })
  }

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`)
  }

  updateReportStatus(id: string, status: string): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, { status })
  }
}
