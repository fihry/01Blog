// create-edit-post-modal.component.ts
import { Component, ViewChild, ElementRef, Output, EventEmitter, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PostService } from "../../../core/services/post.service";
import { ToastService } from "../../../core/services/toast.service";
import type { Post } from "../../../core/services/post.service";

@Component({
  selector: "app-create-edit-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-edit-post-modal.component.html",
})
export class CreateEditPostModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() postToEdit: Post | null = null;
  @Output() postCreated = new EventEmitter<Post>();
  @Output() postUpdated = new EventEmitter<Post>();
  @Output() closeModal = new EventEmitter<void>();

  title = "";
  content = "";
  selectedFiles: File[] = [];
  isSubmitting = false;
  errorMessage: string | null = null;

  @ViewChild("editor") editor!: ElementRef<HTMLDivElement>;

  constructor(
    private postService: PostService,
    private toastService: ToastService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postToEdit'] && this.postToEdit && this.editMode) {
      this.loadPostForEditing();
    }

    if (changes['isOpen'] && !this.isOpen) {
      this.resetForm();
    }
  }

  private loadPostForEditing(): void {
    if (!this.postToEdit) return;

    this.title = this.postToEdit.title;
    this.content = this.postToEdit.content || "";

    // Set editor content after view is initialized
    setTimeout(() => {
      if (this.editor) {
        this.editor.nativeElement.innerHTML = this.content;
      }
    }, 0);
  }

  openOverlay(): void {
    if (!this.isSubmitting) {
      this.isOpen = true;
    }
  }

  closeOverlay(): void {
    if (!this.isSubmitting) {
      this.isOpen = false;
      this.resetForm();
      if (this.editor) {
        this.editor.nativeElement.innerHTML = "";
      }
      this.closeModal.emit();
    }
  }

  updateContent(): void {
    if (!this.editor) return;
    this.content = this.editor.nativeElement.innerHTML;
  }

  applyFormat(type: "bold" | "italic" | "h1" | "h2" | "bullet"): void {
    if (!this.editor) return;
    this.editor.nativeElement.focus();

    switch (type) {
      case "bold":
        this.insertAtCursor("**bold text**");
        break;
      case "italic":
        this.insertAtCursor("_italic text_");
        break;
      case "h1":
        this.insertAtCursor("\n# Heading 1\n");
        break;
      case "h2":
        this.insertAtCursor("\n## Heading 2\n");
        break;
      case "bullet":
        this.insertAtCursor("\n- List item\n");
        break;
    }
    this.updateContent();
  }

  private insertAtCursor(text: string) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);

    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    // Store files for upload
    this.selectedFiles = Array.from(input.files);

    // Preview files in editor
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!this.editor) return;

        const el = this.editor.nativeElement;
        el.focus();
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (file.type.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = reader.result as string;
          img.style.maxWidth = "300px";
          img.style.margin = "5px 0";
          range?.insertNode(img);

          const br = document.createElement("br");
          range?.insertNode(br);
        } else if (file.type.startsWith("video/")) {
          const video = document.createElement("video");
          video.src = reader.result as string;
          video.controls = true;
          video.style.maxWidth = "300px";
          video.style.margin = "5px 0";
          range?.insertNode(video);

          const br = document.createElement("br");
          range?.insertNode(br);
        }
        this.updateContent();
      };
      reader.readAsDataURL(file);
    });

    input.value = "";
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = "Title and content are required.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    if (this.editMode && this.postToEdit) {
      // Update existing post
      this.postService
        .updatePost(this.postToEdit.id, {
          title: this.title.trim(),
          content: this.content.trim(),
          media: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
        })
        .subscribe({
          next: (updatedPost) => {
            this.isSubmitting = false;
            this.toastService.showSuccess("Post updated", "Your post has been updated successfully.");
            this.postUpdated.emit(updatedPost);
            this.closeOverlay();
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error(err);
            const message = err.error?.message || "Failed to update post. Please try again.";
            this.errorMessage = message;
            this.toastService.showError("Error", message);
          },
        });
    } else {
      // Create new post
      this.postService
        .createPost({
          title: this.title.trim(),
          content: this.content.trim(),
          media: this.selectedFiles,
        })
        .subscribe({
          next: (createdPost) => {
            this.isSubmitting = false;
            this.toastService.showSuccess("Post created", "Your post has been published.");
            this.postCreated.emit(createdPost);
            this.closeOverlay();
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error(err);
            const message = err.error?.message || "Failed to create post. Please try again.";
            this.errorMessage = message;
            this.toastService.showError("Error", message);
          },
        });
    }
  }

  private resetForm(): void {
    this.title = "";
    this.content = "";
    this.selectedFiles = [];
    this.errorMessage = null;
    this.editMode = false;
    this.postToEdit = null;
  }
}