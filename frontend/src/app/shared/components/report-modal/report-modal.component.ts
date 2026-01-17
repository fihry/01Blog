// report-modal.component.ts
import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

export interface ReportData {
  type: "post" | "user" | "comment"
  targetId: string
  reason: string
}

@Component({
  selector: "app-report-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:"report-modal.component.html",
  styleUrl:"report-modal.component.scss"
})
export class ReportModalComponent {
  @Input() isOpen = false
  @Input() reportType: "post" | "user" | "comment" = "post"
  @Input() targetId = ""
  @Output() close = new EventEmitter<void>()
  @Output() submit = new EventEmitter<ReportData>()

  selectedReason = ""
  customReason = ""
  isSubmitting = false

  reportOptions = [
    { value: "spam", label: "Spam or misleading" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "hate_speech", label: "Hate speech or discrimination" },
    { value: "violence", label: "Violence or dangerous content" },
    { value: "inappropriate", label: "Inappropriate or offensive content" },
    { value: "copyright", label: "Copyright or trademark violation" },
    { value: "misinformation", label: "False or misleading information" },
    { value: "other", label: "Other (please specify)" },
  ]

  get isValidReport(): boolean {
    if (!this.selectedReason) return false
    if (this.selectedReason === "other" && !this.customReason.trim()) return false
    return true
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.resetForm()
      this.close.emit()
    }
  }

  onSubmit(): void {
    if (!this.isValidReport || this.isSubmitting) return

    const reason = this.selectedReason === "other" 
      ? this.customReason.trim() 
      : this.reportOptions.find(opt => opt.value === this.selectedReason)?.label || this.selectedReason

    this.isSubmitting = true
    
    this.submit.emit({
      type: this.reportType,
      targetId: this.targetId,
      reason,
    })
  }

  resetForm(): void {
    this.selectedReason = ""
    this.customReason = ""
    this.isSubmitting = false
  }

  // Call this from parent after successful submission
  completeSubmission(): void {
    this.resetForm()
    this.close.emit()
  }
}