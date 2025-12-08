// src/app/shared/services/toast.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();

  get toasts$(): Observable<Toast> {
    return this.toastSubject.asObservable();
  }

  showSuccess(title: string, message: string): void {
    this.toastSubject.next({ title, message, type: 'success', delay: 3000 });
  }

  showError(title: string, message: string): void {
    this.toastSubject.next({ title, message, type: 'error', delay: 5000 });
  }
  
  // You can add showInfo() here 
}