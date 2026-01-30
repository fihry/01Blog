import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from 'rxjs';
import { CreatePostModalService } from './create-post-modal.service';

@Component({
  selector: 'app-create-post-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-post-trigger.component.html'
})
export class CreatePostTriggerComponent {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() avatar$?: Observable<string | null>;

  constructor(private modalService: CreatePostModalService) {}

  openModal(): void {
    this.modalService.open();
  }
}
