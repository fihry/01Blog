import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Observable } from "rxjs";
import { ToastService, type Toast } from "../../core/services/toast.service"

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
    templateUrl: "./toast.component.html",
    styleUrls: ["./toast.component.scss"]
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  remove(id: string) {
    this.toastService.remove(id);
  }
}
