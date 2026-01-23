import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"

export interface Report {
  id: string
  reporter?: any
  targetId: string
  reportType: "POST" | "USER" | "COMMENT"
  reason: string
  createdAt: string
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED"
}

interface CreateReportRequest {
  targetId: string
  reportType: "POST" | "USER" | "COMMENT"
  reason: string
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/report`

  constructor(private http: HttpClient) { }

  createReport(request: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}`, request)
  }

  getReports(status: string = "PENDING"): Observable<Report[]> {
    return this.http.get<Report[]>(`${environment.apiUrl}/admin/reports/${status}`)
  }

  updateReportStatus(id: string, status: string): Observable<Report> {
    return this.http.put<Report>(`${environment.apiUrl}/admin/reports/${id}/status`, status)
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/reports/${id}`)
  }
}
