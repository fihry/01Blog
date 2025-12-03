import { Component, Input, Output, EventEmitter, ViewChild, type TemplateRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { ReportService } from "../../core/services/report.service"
import { ToastService } from "../../shared/services/toast.service"

@Component({
  selector: "app-report-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <ng-template #reportModal let-modal>
      <div class="modal-header border-b border-border p-4 flex items-center justify-between">
        <h4 class="text-lg font-bold text-foreground">Report {{ targetType }}</h4>
        <button (click)="modal.dismiss()" class="text-muted-foreground hover:text-foreground">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="modal-body p-4">
        <form [formGroup]="reportForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Reason for reporting</label>
            <select
              formControlName="reason"
              class="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="misinformation">Misinformation</option>
              <option value="copyright">Copyright violation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Additional details (optional)</label>
            <textarea
              formControlName="details"
              rows="4"
              class="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Provide any additional information..."
            ></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer border-t border-border p-4 flex justify-end gap-2">
        <button
          (click)="modal.dismiss()"
          class="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition"
        >
          Cancel
        </button>
        <button
          (click)="submitReport(modal)"
          [disabled]="!reportForm.get('reason')?.value || isLoading"
          class="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ isLoading ? 'Submitting...' : 'Submit Report' }}
        </button>
      </div>
    </ng-template>
  `,
})
export class ReportModalComponent {
  @Input() targetId!: number
  @Input() targetType: "post" | "user" | "comment" = "post"
  @Output() reportSubmitted = new EventEmitter<void>()
  @ViewChild("reportModal") reportModal!: TemplateRef<any>

  reportForm: FormGroup
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private toastService: ToastService,
    private modalService: NgbModal,
  ) {
    this.reportForm = this.fb.group({
      reason: ["", Validators.required],
      details: [""],
    })
  }

  openModal(): void {
    this.modalService.open(this.reportModal, { centered: true })
  }

  submitReport(modal: any): void {
    if (this.reportForm.get("reason")?.value) {
      this.isLoading = true
      this.reportService
        .createReport(this.targetId, {
          type: this.targetType,
          reason: this.reportForm.get("reason")!.value,
        })
        .subscribe({
          next: () => {
            this.toastService.success("Report submitted successfully")
            this.reportForm.reset()
            this.isLoading = false
            modal.dismiss()
            this.reportSubmitted.emit()
          },
          error: () => {
            this.toastService.error("Failed to submit report")
            this.isLoading = false
          },
        })
    }
  }
}
