import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable } from "rxjs"
import { tap } from "rxjs/operators"

interface AuthResponse {
  accessToken: string
  tokenType: string
  user: {
    id: string
    username: string
    email: string
    role: string
    avatar_url?: string
  }
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:8000/api/auth"
  private currentUserSubject = new BehaviorSubject<AuthResponse["user"] | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false)
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadUser()
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem("token", response.accessToken)
        localStorage.setItem("user", JSON.stringify(response.user))
        console.log(`respons token: ${response.accessToken}`)
        this.currentUserSubject.next(response.user)
        this.isAuthenticatedSubject.next(true)
      }),
    )
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        localStorage.setItem("token", response.accessToken)
        localStorage.setItem("user", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
        this.isAuthenticatedSubject.next(true)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.currentUserSubject.next(null)
    this.isAuthenticatedSubject.next(false)
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  private loadUser(): void {
    const token = this.getToken()
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        this.currentUserSubject.next(user)
        this.isAuthenticatedSubject.next(true)
      } catch (e) {
        console.error("Failed to parse user from local storage", e)
        this.logout()
      }
    } else if (token) {
      // Token exists but user doesn't - might want to fetch profile here
      this.isAuthenticatedSubject.next(true)
    }
  }
}
