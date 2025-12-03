import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast[]>([])
  public toasts$ = this.toastSubject.asObservable()

  success(message: string, duration = 3000): void {
    this.addToast(message, "success", duration)
  }

  error(message: string, duration = 3000): void {
    this.addToast(message, "error", duration)
  }

  info(message: string, duration = 3000): void {
    this.addToast(message, "info", duration)
  }

  private addToast(message: string, type: Toast["type"], duration: number): void {
    const id = Date.now().toString()
    const toast: Toast = { id, message, type, duration }
    const currentToasts = this.toastSubject.value
    this.toastSubject.next([...currentToasts, toast])

    setTimeout(() => {
      this.removeToast(id)
    }, duration)
  }

  private removeToast(id: string): void {
    const currentToasts = this.toastSubject.value
    this.toastSubject.next(currentToasts.filter((t) => t.id !== id))
  }
}
