import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ToastService, type Toast } from "../../core/services/toast.service"

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-4" style="z-index: 1055; pointer-events: none;">
      <div *ngFor="let toast of toasts$ | async" 
           class="toast show align-items-center mb-2 border-0 shadow-lg animate-in" 
           role="alert" 
           aria-live="assertive" 
           aria-atomic="true"
           style="pointer-events: auto; min-width: 300px;"
           [ngClass]="{
             'bg-white text-foreground': toast.type === 'info', 
             'bg-background text-foreground': toast.type === 'warning',
             'bg-destructive text-destructive-foreground': toast.type === 'error',
             'bg-primary text-primary-foreground': toast.type === 'success'
           }">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-3 w-100 py-3 px-4">
            <!-- Icons -->
            <i class="bi bi-check-circle-fill text-xl" *ngIf="toast.type === 'success'"></i>
            <i class="bi bi-exclamation-circle-fill text-xl" *ngIf="toast.type === 'error'"></i>
            <i class="bi bi-info-circle-fill text-xl" *ngIf="toast.type === 'info'"></i>
            <i class="bi bi-exclamation-triangle-fill text-xl" *ngIf="toast.type === 'warning'"></i>

            <span class="font-medium text-sm">{{ toast.message }}</span>
            
            <button type="button" 
                    class="btn-close ms-auto me-0 focus:outline-none focus:shadow-none p-2" 
                    [class.btn-close-white]="toast.type === 'success' || toast.type === 'error'"
                    (click)="remove(toast.id)" 
                    aria-label="Close"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      backdrop-filter: blur(10px);
      border-radius: var(--radius);
      transition: all 0.3s ease;
    }
  `]
})
export class ToastComponent {
  toasts$;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  remove(id: string) {
    this.toastService.remove(id);
  }
}
