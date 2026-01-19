// create-edit-post-modal.component.ts
import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PostService } from "../../../core/services/post.service";
import { ToastService } from "../../../core/services/toast.service";
import type { Post } from "../../../core/services/post.service";
import { Router } from "@angular/router";
import markdownit from "markdown-it";

interface MediaFile {
  file: File;
  url: string;
}

@Component({
  selector: "app-create-edit-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-edit-post-modal.component.html",
  styles: [`
    .split-pane {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      height: 60vh;
      min-height: 400px;
    }
    textarea.editor-pane {
      width: 100%;
      height: 100%;
      resize: none;
      font-family: monospace;
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
    }
    .preview-pane {
      height: 100%;
      overflow-y: auto;
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      background: #f8f9fa;
    }
    .preview-pane ::ng-deep img, .preview-pane ::ng-deep video {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    .preview-pane ::ng-deep h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .preview-pane ::ng-deep h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .preview-pane ::ng-deep p { margin-bottom: 1rem; }
    .preview-pane ::ng-deep ul, .preview-pane ::ng-deep ol { margin-bottom: 1rem; padding-left: 1.5rem; }
  `]
})
export class CreateEditPostModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() postToEdit: Post | null = null;

  @Output() postCreated = new EventEmitter<Post>();
  @Output() postUpdated = new EventEmitter<Post>();
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  title = "";
  content = "";
  previewContent = "";
  isSubmitting = false;
  errorMessage: string | null = null;

  private md = markdownit({ html: true, linkify: true, breaks: true });

  // Media arrays
  private mediaFiles: MediaFile[] = [];

  constructor(
    private readonly postService: PostService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.shouldLoadPostForEditing(changes)) this.loadPostForEditing();
    if (this.shouldResetForm(changes)) this.resetForm();
  }

  ngOnDestroy(): void {
    this.revokePreviewUrls();
  }

  openOverlay(): void {
    if (!this.isSubmitting) this.isOpen = true;
  }

  closeOverlay(): void {
    if (this.isSubmitting) return;
    this.isOpen = false;
    this.resetForm();
    this.closeModal.emit();
  }

  // -------------------- Markdown + Media Handling --------------------

  updatePreview(): void {
    this.syncMediaWithContent();

    // Replace placeholders with blob URLs for live preview
    let tempContent = this.content;
    const mediaRegex = /!\[(.*?)\]\({{MEDIA_INDEX_(\d+)}}\)/g;

    tempContent = tempContent.replace(mediaRegex, (match, alt, index) => {
      const idx = parseInt(index, 10);
      const media = this.mediaFiles[idx];
      if (!media) return match;

      if (media.file.type.startsWith('video/')) {
        return `<video src="${media.url}" controls class="w-100 rounded mb-2" style="max-height: 400px;"></video>`;
      } else {
        return `![${alt}](${media.url})`;
      }
    });

    this.previewContent = this.md.render(tempContent);
  }

  insertFormat(type: string): void {
    const textarea = this.textareaRef.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.content;
    const selection = text.slice(start, end);
    let replacement = '';

    switch (type) {
      case 'bold': replacement = `**${selection || 'bold text'}**`; break;
      case 'italic': replacement = `*${selection || 'italic text'}*`; break;
      case 'h1': replacement = `\n# ${selection || 'Heading 1'}\n`; break;
      case 'h2': replacement = `\n## ${selection || 'Heading 2'}\n`; break;
      case 'bullet': replacement = `\n- ${selection || 'List item'}\n`; break;
    }

    this.content = text.slice(0, start) + replacement + text.slice(end);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
      this.updatePreview();
    }, 0);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const url = URL.createObjectURL(file);
      this.mediaFiles.push({ file, url });

      // Insert placeholder at cursor
      const index = this.mediaFiles.length - 1;
      this.insertAtCursor(`![${file.name}]({{MEDIA_INDEX_${index}}})\n`);
    });

    this.updatePreview();
    input.value = '';
  }

  private insertAtCursor(text: string): void {
    if (!this.textareaRef) {
      this.content += text;
      return;
    }
    const textarea = this.textareaRef.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    this.content = this.content.slice(0, start) + text + this.content.slice(end);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }

  // -------------------- Sync Media --------------------

  private getUsedMediaIndexes(): number[] {
    const regex = /!\[.*?\]\({{MEDIA_INDEX_(\d+)}}\)/g;
    const usedIndexes: number[] = [];
    let match;
    while ((match = regex.exec(this.content)) !== null) {
      usedIndexes.push(parseInt(match[1], 10));
    }
    return usedIndexes;
  }

  private syncMediaWithContent(): void {
    const usedIndexes = this.getUsedMediaIndexes();

    // Keep only used media
    this.mediaFiles = this.mediaFiles.filter((_, i) => usedIndexes.includes(i));

    // Rebuild placeholders in content to have continuous indexes
    let newIndex = 0;
    this.content = this.content.replace(/!\[.*?\]\({{MEDIA_INDEX_(\d+)}}\)/g, () => {
      return `![media]({{MEDIA_INDEX_${newIndex++}}})`;
    });
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = "Title and content are required.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.syncMediaWithContent(); // Make sure media and content match

    const postData = {
      title: this.title.trim(),
      content: this.content,
      media: this.mediaFiles.map(m => m.file),
    };

    if (this.editMode && this.postToEdit) {
      this.updateExistingPost(postData);
    } else {
      this.createNewPost(postData);
    }
  }


  private createNewPost(postData: any): void {
    this.postService.createPost(postData).subscribe({
      next: post => this.handleSuccess(post, "Post created"),
      error: err => this.handleError(err, "Failed to create post."),
    });
  }

  private updateExistingPost(postData: any): void {
    if (!this.postToEdit) return;
    this.postService.updatePost(this.postToEdit.id, postData).subscribe({
      next: post => this.handleSuccess(post, "Post updated"),
      error: err => this.handleError(err, "Failed to update post."),
    });
  }

  private handleSuccess(post: Post, msg: string): void {
    this.isSubmitting = false;
    this.toastService.showSuccess(msg, "Operation successful.");
    this.editMode ? this.postUpdated.emit(post) : this.postCreated.emit(post);
    this.closeOverlay();
    // ridirect 
    this.router.navigate(['/posts', post.id]);
  }

  private handleError(error: any, defaultMessage: string): void {
    this.isSubmitting = false;
    console.error(error);
    this.errorMessage = error.error?.message || `${defaultMessage} Please try again.`;
    this.toastService.showError("Error", this.errorMessage || "Something went wrong");
  }

  // Helpers
  private revokePreviewUrls(): void {
    this.mediaFiles.forEach(media => URL.revokeObjectURL(media.url));
  }

  private shouldLoadPostForEditing(changes: SimpleChanges): boolean {
    return Boolean(changes["postToEdit"] && this.postToEdit && this.editMode);
  }

  private shouldResetForm(changes: SimpleChanges): boolean {
    return Boolean(changes["isOpen"] && !this.isOpen);
  }

  private loadPostForEditing(): void {
    if (!this.postToEdit) return;
    this.title = this.postToEdit.title;
    this.content = this.postToEdit.content || "";
    this.updatePreview();
  }

  private resetForm(): void {
    this.title = "";
    this.content = "";
    this.previewContent = "";
    this.revokePreviewUrls();
    this.mediaFiles = [];
    this.errorMessage = null;
    this.editMode = false;
    this.postToEdit = null;
  }
}
