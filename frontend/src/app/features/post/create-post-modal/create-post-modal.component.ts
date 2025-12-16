import { Component, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-create-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay">
      <div class="app-widget-card p-4 w-full max-w-2xl shadow-lg m-4 animate-in">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-2xl font-bold text-foreground m-0">Create Post</h2>
            <button class="btn-close" (click)="close()"></button>
        </div>
        
        <form class="d-flex flex-column gap-3">
          <div>
            <label class="form-label text-muted-foreground text-sm font-medium mb-1">Title</label>
            <input type="text" placeholder="Post title" class="form-control" />
          </div>
          
          <div>
            <label class="form-label text-muted-foreground text-sm font-medium mb-1">Content</label>
            <textarea placeholder="Write your post here..." rows="6" class="form-control"></textarea>
          </div>
          
          <div>
            <label class="form-label text-muted-foreground text-sm font-medium mb-1">Tags</label>
            <input type="text" placeholder="Add tags separated by commas" class="form-control" />
          </div>
          
          <div class="d-flex gap-2 justify-content-end mt-4">
            <button type="button" class="btn btn-outline-secondary" (click)="close()">Cancel</button>
            <button type="submit" class="btn btn-primary">Publish Post</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreatePostModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}
