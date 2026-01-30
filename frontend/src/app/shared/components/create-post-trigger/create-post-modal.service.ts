import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface CreatePostModalOpenPayload {
  editMode?: boolean;
  post?: any;
}

@Injectable({ providedIn: 'root' })
export class CreatePostModalService {
  private openSubject = new Subject<CreatePostModalOpenPayload | undefined>();
  readonly open$: Observable<CreatePostModalOpenPayload | undefined> = this.openSubject.asObservable();

  open(payload?: CreatePostModalOpenPayload): void {
    this.openSubject.next(payload);
  }
}
