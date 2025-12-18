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
  templateUrl:"./create-post-modal.component.html"
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
          this.toastService.showInfo("Post created", "Your post has been published.")
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
