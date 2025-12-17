import { Component, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { PostService } from "../../../core/services/post.service"
import type { Post } from "../../../core/services/post.service"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-create-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Inline trigger card -->
    <div class="app-widget-card mb-4 p-4 cursor-pointer" (click)="openOverlay()" *ngIf="!isOverlayOpen">
      <div class="d-flex align-items-start gap-3">
        <div class="avatar-placeholder flex-shrink-0"></div>
        <div class="flex-grow-1">
          <div class="bg-muted rounded-3 px-4 py-3 text-muted-foreground text-sm">
            What's on your mind? Start a post...
          </div>
        </div>
      </div>
    </div>

    <!-- Medium-style centered editor overlay -->
    <div
      *ngIf="isOverlayOpen"
      class="modal-overlay d-flex align-items-center justify-content-center"
      style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1050;"
    >
      <div
        class="app-widget-card w-100 shadow-lg"
        style="max-width: 900px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;"
      >
        <div class="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span class="text-sm text-muted-foreground">Draft</span>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            (click)="closeOverlay()"
            [disabled]="isSubmitting"
          ></button>
        </div>

        <form
          class="d-flex flex-column flex-grow-1"
          (ngSubmit)="onSubmit()"
        >
          <!-- Toolbar -->
          <div class="px-4 py-2 border-bottom d-flex align-items-center gap-2 flex-wrap">
            <button type="button" class="btn btn-ghost btn-sm" (click)="applyFormat('h1')">
              H1
            </button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="applyFormat('h2')">
              H2
            </button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="applyFormat('bold')">
              <strong>B</strong>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="applyFormat('italic')">
              <em>I</em>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="applyFormat('bullet')">
              • List
            </button>

            <div class="vr mx-2"></div>

            <label class="btn btn-ghost btn-sm d-flex align-items-center gap-2 mb-0">
              <i class="bi bi-image text-primary"></i>
              <span class="text-xs">Image / Video</span>
              <input
                type="file"
                class="d-none"
                multiple
                accept="image/*,video/*"
                (change)="onFilesSelected($event)"
              />
            </label>
          </div>

          <!-- Editor body -->
          <div class="px-4 py-3 flex-grow-1 overflow-auto">
            <input
              type="text"
              placeholder="Title"
              class="form-control border-0 fs-3 fw-bold px-0 mb-3"
              style="box-shadow: none;"
              [(ngModel)]="title"
              name="title"
              required
              minlength="3"
            />

            <textarea
              #contentArea
              placeholder="Write your story..."
              rows="10"
              class="form-control border-0 px-0"
              style="box-shadow: none; resize: none;"
              [(ngModel)]="content"
              name="content"
              required
              minlength="10"
            ></textarea>

            <div class="text-xs text-muted-foreground mt-2">
              {{ content.length }} characters
            </div>
          </div>

          <div class="px-4 py-3 border-top d-flex justify-content-between align-items-center">
            <div class="text-xs text-muted-foreground">
              Your post will be visible to your followers.
            </div>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                (click)="closeOverlay()"
                [disabled]="isSubmitting"
              >
                Close
              </button>
              <button
                type="submit"
                class="btn btn-primary btn-sm"
                [disabled]="isSubmitting || !title || !content"
              >
                <span *ngIf="!isSubmitting">Publish</span>
                <span *ngIf="isSubmitting" class="d-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  Publishing...
                </span>
              </button>
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger mb-0 mx-4 my-2 py-2 px-3 text-sm">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreatePostModalComponent {
  @Output() postCreated = new EventEmitter<Post>()

  title = ""
  content = ""
  selectedFiles: File[] = []
  isSubmitting = false
  errorMessage: string | null = null
  isOverlayOpen = false

  constructor(
    private postService: PostService,
    private toastService: ToastService,
  ) {}

  openOverlay(): void {
    if (!this.isSubmitting) {
      this.isOverlayOpen = true
    }
  }

  closeOverlay(): void {
    if (!this.isSubmitting) {
      this.isOverlayOpen = false
      this.resetForm()
    }
  }

  applyFormat(type: "bold" | "italic" | "h1" | "h2" | "bullet"): void {
    // Simple markdown-like formatting helpers
    switch (type) {
      case "bold":
        this.content += this.content ? " **bold text**" : "**bold text**"
        break
      case "italic":
        this.content += this.content ? " _italic text_" : "_italic text_"
        break
      case "h1":
        this.content += (this.content ? "\n\n" : "") + "# Heading 1"
        break
      case "h2":
        this.content += (this.content ? "\n\n" : "") + "## Heading 2"
        break
      case "bullet":
        this.content += (this.content ? "\n" : "") + "- List item"
        break
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files)
    } else {
      this.selectedFiles = []
    }
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = "Title and content are required."
      return
    }

    this.isSubmitting = true
    this.errorMessage = null

    this.postService
      .createPost({
        title: this.title.trim(),
        content: this.content.trim(),
        media: this.selectedFiles,
      })
      .subscribe({
        next: (createdPost) => {
          this.isSubmitting = false
          this.toastService.showSuccess("Post created", "Your post has been published.")
          this.postCreated.emit(createdPost)
          this.resetForm()
          this.isOverlayOpen = false
        },
        error: (err) => {
          console.error("Failed to create post", err)
          this.isSubmitting = false
          const message = err.error?.message || "Failed to create post. Please try again."
          this.errorMessage = message
          this.toastService.showError("Error", message)
        },
      })
  }

  private resetForm(): void {
    this.title = ""
    this.content = ""
    this.selectedFiles = []
    this.errorMessage = null
  }
}
