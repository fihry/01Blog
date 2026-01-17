// src/app/shared/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id : string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private add(toast: Toast) {
    const toasts = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(toasts);

    if (toast.delay) {
      setTimeout(() => this.remove(toast.id), toast.delay);
    }
  }

  remove(id: string) {
    this.toastsSubject.next(
      this.toastsSubject.value.filter(toast=>toast.id !==id)
    );
  }

  showSuccess(title: string, message: string) {
    this.add({
      id: crypto.randomUUID(),
      title,
      message,
      type: 'success',
      delay: 3000
    });
  }

  showError(title: string, message: string) {
    this.add({
      id: crypto.randomUUID(),
      title,
      message,
      type: 'error',
      delay: 5000
    });
  }

  showInfo(title: string, message: string) {
    this.add({
      id: crypto.randomUUID(),
      title,
      message,
      type: 'info',
      delay: 3000
    });
  }

  showWarning(title: string, message: string) {
    this.add({
      id: crypto.randomUUID(),
      title,
      message,
      type: 'warning',
      delay: 5000
    });
  }
}
