// create-edit-post-modal.component.ts
import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PostService } from "../../../core/services/post.service";
import { ToastService } from "../../../core/services/toast.service";
import type { Post } from "../../../core/services/post.service";

type FormatType = "bold" | "italic" | "h1" | "h2" | "bullet";

interface MediaFile {
  url: string;
  file: File;
}

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

  @ViewChild("editor") editor!: ElementRef<HTMLDivElement>;

  title = "";
  content = "";
  isSubmitting = false;
  errorMessage: string | null = null;

  private activeFileUrls = new Map<string, File>();

  private readonly FORMAT_TEMPLATES: Record<FormatType, string> = {
    bold: "**bold text**",
    italic: "_italic text_",
    h1: "\n# Heading 1\n",
    h2: "\n## Heading 2\n",
    bullet: "\n- List item\n",
  };

  constructor(
    private readonly postService: PostService,
    private readonly toastService: ToastService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.shouldLoadPostForEditing(changes)) {
      this.loadPostForEditing();
    }

    if (this.shouldResetForm(changes)) {
      this.resetForm();
    }
  }

  openOverlay(): void {
    if (!this.isSubmitting) {
      this.isOpen = true;
    }
  }

  closeOverlay(): void {
    if (this.isSubmitting) return;

    this.isOpen = false;
    this.resetForm();
    this.clearEditorContent();
    this.closeModal.emit();
  }

  updateContent(): void {
    if (!this.editor) return;
    this.content = this.editor.nativeElement.innerHTML;
  }

  applyFormat(type: FormatType): void {
    if (!this.editor) return;

    this.editor.nativeElement.focus();
    this.insertAtCursor(this.FORMAT_TEMPLATES[type]);
    this.updateContent();
  }

  onFilesSelected(event: Event): void {
    const files = this.getFilesFromEvent(event);
    if (!files) return;

    files.forEach((file) => this.processFile(file));
    this.clearFileInput(event);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = "Title and content are required.";
      return;
    }

    this.startSubmission();

    const { processedContent, files } = this.processContentForSubmission();
    const postData = {
      title: this.title.trim(),
      content: processedContent,
      media: files.length > 0 ? files : undefined,
    };

    if (this.editMode && this.postToEdit) {
      this.updateExistingPost(postData);
    } else {
      this.createNewPost(postData);
    }
  }

  // Private helper methods

  private shouldLoadPostForEditing(changes: SimpleChanges): boolean {
    return Boolean(
      changes["postToEdit"] && this.postToEdit && this.editMode
    );
  }

  private shouldResetForm(changes: SimpleChanges): boolean {
    return Boolean(changes["isOpen"] && !this.isOpen);
  }

  private loadPostForEditing(): void {
    if (!this.postToEdit) return;

    this.title = this.postToEdit.title;
    this.content = this.postToEdit.content || "";

    setTimeout(() => this.setEditorContent(this.content), 0);
  }

  private setEditorContent(content: string): void {
    if (this.editor) {
      this.editor.nativeElement.innerHTML = content;
    }
  }

  private clearEditorContent(): void {
    this.setEditorContent("");
  }

  private insertAtCursor(text: string): void {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    this.updateCursorPosition(range, textNode, selection);
  }

  private updateCursorPosition(
    range: Range,
    node: Node,
    selection: Selection
  ): void {
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  private getFilesFromEvent(event: Event): File[] | null {
    const input = event.target as HTMLInputElement;
    return input.files ? Array.from(input.files) : null;
  }

  private processFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.activeFileUrls.set(url, file);

    if (!this.editor) return;

    this.insertMediaElement(file, url);
    this.updateContent();
  }

  private insertMediaElement(file: File, url: string): void {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (!range) return;

    const element = this.createMediaElement(file, url);
    range.insertNode(element);
    range.insertNode(document.createElement("br"));
  }

  private createMediaElement(file: File, url: string): HTMLElement {
    const element = file.type.startsWith("image/")
      ? this.createImageElement(url)
      : this.createVideoElement(url);

    return element;
  }

  private createImageElement(url: string): HTMLImageElement {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "300px";
    img.style.margin = "5px 0";
    return img;
  }

  private createVideoElement(url: string): HTMLVideoElement {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.style.maxWidth = "300px";
    video.style.margin = "5px 0";
    return video;
  }

  private clearFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = "";
  }

  private isFormValid(): boolean {
    return Boolean(this.title.trim() && this.content.trim());
  }

  private startSubmission(): void {
    this.isSubmitting = true;
    this.errorMessage = null;
  }

  private processContentForSubmission(): {
    processedContent: string;
    files: File[];
  } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.content, "text/html");

    const files = this.replaceMediaWithPlaceholders(doc);
    const processedContent = this.convertHtmlToText(doc);

    return { processedContent, files };
  }

  private replaceMediaWithPlaceholders(doc: Document): File[] {
    const mediaElements = doc.querySelectorAll("img, video");
    const files: File[] = [];

    mediaElements.forEach((element) => {
      const src = element.getAttribute("src");
      if (!src || !this.activeFileUrls.has(src)) return;

      const file = this.activeFileUrls.get(src)!;
      files.push(file);

      const placeholder = document.createTextNode(
        `![image]({{MEDIA_INDEX_${files.length - 1}}})`
      );
      element.replaceWith(placeholder);
    });

    return files;
  }

  private convertHtmlToText(doc: Document): string {
    this.convertBreaksToNewlines(doc);
    this.convertBlocksToNewlines(doc);
    return doc.body.textContent || "";
  }

  private convertBreaksToNewlines(doc: Document): void {
    doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  }

  private convertBlocksToNewlines(doc: Document): void {
    doc.querySelectorAll("div, p").forEach((block) => {
      block.prepend(document.createTextNode("\n"));
    });
  }

  private createNewPost(postData: any): void {
    this.postService.createPost(postData).subscribe({
      next: (post) => this.handlePostCreated(post),
      error: (err) => this.handleError(err, "Failed to create post."),
    });
  }

  private updateExistingPost(postData: any): void {
    if (!this.postToEdit) return;

    this.postService.updatePost(this.postToEdit.id, postData).subscribe({
      next: (post) => this.handlePostUpdated(post),
      error: (err) => this.handleError(err, "Failed to update post."),
    });
  }

  private handlePostCreated(post: Post): void {
    this.isSubmitting = false;
    this.toastService.showSuccess(
      "Post created",
      "Your post has been published."
    );
    this.postCreated.emit(post);
    this.closeOverlay();
  }

  private handlePostUpdated(post: Post): void {
    this.isSubmitting = false;
    this.toastService.showSuccess(
      "Post updated",
      "Your post has been updated successfully."
    );
    this.postUpdated.emit(post);
    this.closeOverlay();
  }

  private handleError(error: any, defaultMessage: string): void {
    this.isSubmitting = false;
    console.error(error);

    const message = error.error?.message || `${defaultMessage} Please try again.`;
    this.errorMessage = message;
    this.toastService.showError("Error", message);
  }

  private resetForm(): void {
    this.title = "";
    this.content = "";
    this.activeFileUrls.clear();
    this.errorMessage = null;
    this.editMode = false;
    this.postToEdit = null;
  }
}