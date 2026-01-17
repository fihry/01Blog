import { Component, Input, Output, EventEmitter, ViewChild, type TemplateRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { ReportService } from "../../../core/services/report.service"
import { ToastService } from "../../../core/services/toast.service"

@Component({
  selector: "app-report-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <ng-template #reportModal let-modal>
      <div class="modal-header">
        <h4 class="modal-title font-bold">Report {{ targetType }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss()"></button>
      </div>
      <div class="modal-body">
        <form [formGroup]="reportForm">
          <div class="mb-3">
            <label class="form-label font-medium">Reason for reporting</label>
            <select formControlName="reason" class="form-select">
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="misinformation">Misinformation</option>
              <option value="copyright">Copyright violation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label font-medium">Additional details (optional)</label>
            <textarea
              formControlName="details"
              rows="4"
              class="form-control"
              placeholder="Provide any additional information..."
            ></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">Cancel</button>
        <button
          type="button"
          class="btn btn-danger"
          (click)="submitReport(modal)"
          [disabled]="!reportForm.get('reason')?.value || isLoading"
        >
          {{ isLoading ? 'Submitting...' : 'Submit Report' }}
        </button>
      </div>
    </ng-template>
  `,
})
export class ReportModalComponent {
  @Input() targetId!: string
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
            this.toastService.showSuccess("Report", "Report submitted successfully")
            this.reportForm.reset()
            this.isLoading = false
            modal.dismiss()
            this.reportSubmitted.emit()
          },
          error: () => {
            this.toastService.showError("Report", "Failed to submit report")
            this.isLoading = false
          },
        })
    }
  }
}
