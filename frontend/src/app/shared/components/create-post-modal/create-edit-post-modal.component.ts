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
import { MarkdownService } from "../../../core/services/markdown.service";
import type { Post } from "../../../core/services/post.service";
import { Router } from "@angular/router";

interface MediaFile {
  file: File;
  url: string;
}

@Component({
  selector: "app-create-edit-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-edit-post-modal.component.html",
  styleUrl:"create-edit-post-modal.component.scss"
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

  private mediaFiles: MediaFile[] = [];

  constructor(
    private readonly postService: PostService,
    private readonly toastService: ToastService,
    private readonly markdownService: MarkdownService,
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

  updatePreview(): void {
    this.syncMediaWithContent();
    let tempContent = this.content;

    // Replace placeholders with blob URLs for live preview
    const mediaRegex = /!\[(.*?)\]\({{MEDIA_INDEX_(\d+)}}\)/g;
    tempContent = tempContent.replace(mediaRegex, (match, alt, index) => {
      const idx = parseInt(index, 10);
      const media = this.mediaFiles[idx];
      if (!media) return match;

      if (media.file.type.startsWith('video/')) {
        return `<video src="${media.url}" controls style="max-width:100%; margin:5px 0;"></video>`;
      }
      return `![${alt}](${media.url})`;
    });

    this.previewContent = this.markdownService.parse(tempContent, false);
  }

  insertFormat(type: string): void {
    const textarea = this.textareaRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = this.content.slice(start, end);

    const formats: Record<string, string> = {
      bold: `**${selection || 'bold text'}**`,
      italic: `*${selection || 'italic text'}*`,
      code: `\`${selection || 'code'}\``,
      h1: `\n# ${selection || 'Heading 1'}\n`,
      h2: `\n## ${selection || 'Heading 2'}\n`,
      h3: `\n### ${selection || 'Heading 3'}\n`,
      bullet: `\n- ${selection || 'List item'}\n`,
      number: `\n1. ${selection || 'List item'}\n`,
      quote: `\n> ${selection || 'Quote'}\n`,
      link: `[${selection || 'link text'}](url)`,
      hr: `\n---\n`
    };

    const replacement = formats[type] || '';
    this.content = this.content.slice(0, start) + replacement + this.content.slice(end);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + replacement.length;
      textarea.setSelectionRange(newPos, newPos);
      this.updatePreview();
    }, 0);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const url = URL.createObjectURL(file);
      this.mediaFiles.push({ file, url });

      const index = this.mediaFiles.length - 1;
      this.insertAtCursor(`![${file.name}]({{MEDIA_INDEX_${index}}})\n`);
    });

    this.updatePreview();
    input.value = '';
  }

  private insertAtCursor(text: string): void {
    const textarea = this.textareaRef?.nativeElement;

    if (!textarea) {
      this.content += text;
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    this.content = this.content.slice(0, start) + text + this.content.slice(end);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

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

    // Revoke unused URLs and filter
    this.mediaFiles = this.mediaFiles.filter((media, i) => {
      if (!usedIndexes.includes(i)) {
        URL.revokeObjectURL(media.url);
        return false;
      }
      return true;
    });

    // Rebuild placeholders with continuous indexes
    let newIndex = 0;
    this.content = this.content.replace(
      /!\[(.*?)\]\({{MEDIA_INDEX_(\d+)}}\)/g,
      (match, alt) => `![${alt}]({{MEDIA_INDEX_${newIndex++}}})`
    );
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.errorMessage = "Title and content are required.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.syncMediaWithContent();

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
      next: post => this.handleSuccess(post, "Post created successfully"),
      error: err => this.handleError(err, "Failed to create post"),
    });
  }

  private updateExistingPost(postData: any): void {
    if (!this.postToEdit) return;

    this.postService.updatePost(this.postToEdit.id, postData).subscribe({
      next: post => this.handleSuccess(post, "Post updated successfully"),
      error: err => this.handleError(err, "Failed to update post"),
    });
  }

  private handleSuccess(post: Post, message: string): void {
    this.isSubmitting = false;
    this.toastService.showSuccess(message, "Success");

    if (this.editMode) {
      this.postUpdated.emit(post);
    } else {
      this.postCreated.emit(post);
    }

    this.closeOverlay();
    this.router.navigate(['/posts', post.id]);
  }

  private handleError(error: any, defaultMessage: string): void {
    this.isSubmitting = false;
    console.error(error);

    this.errorMessage = error.error?.message || `${defaultMessage}. Please try again.`;
    this.toastService.showError("Error", this.errorMessage || "Unkonow error");
  }

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