import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap"

@Component({
  selector: "app-notification-bell",
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  template: `
    <div class="position-relative" ngbDropdown placement="bottom-end">
      <button class="btn btn-ghost p-2 d-flex align-items-center justify-content-center position-relative text-muted-foreground hover:text-foreground" 
              style="width: 2.5rem; height: 2.5rem; border-radius: 50%;" 
              ngbDropdownToggle
              id="notificationDropdown">
        <i class="bi bi-bell h-6 w-6"></i>
        <span class="indicator-dot" style="top: 0.25rem; right: 0.25rem;"></span>
      </button>
      
      <div ngbDropdownMenu 
           aria-labelledby="notificationDropdown"
           class="dropdown-menu-custom shadow-lg py-0" 
           style="min-width: 320px; max-width: 90vw; z-index: 1050;">
        <div class="p-3 border-bottom border-muted d-flex justify-content-between align-items-center">
          <h3 class="font-bold text-foreground text-sm m-0">Notifications</h3>
          <button class="btn btn-ghost btn-sm text-xs text-primary p-1">Mark all read</button>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
          <div class="dropdown-item p-3 border-bottom border-muted cursor-pointer hover:bg-muted/50">
            <div class="d-flex gap-3">
              <div class="avatar-placeholder w-10 h-10 flex-shrink-0"></div>
              <div class="flex-grow-1 min-w-0">
                <p class="text-foreground text-sm m-0"><strong>John Doe</strong> liked your post</p>
                <p class="text-muted-foreground text-xs mt-1 m-0">2 hours ago</p>
              </div>
            </div>
          </div>
          <div class="dropdown-item p-3 border-bottom border-muted cursor-pointer hover:bg-muted/50">
            <div class="d-flex gap-3">
              <div class="avatar-placeholder w-10 h-10 flex-shrink-0"></div>
              <div class="flex-grow-1 min-w-0">
                <p class="text-foreground text-sm m-0"><strong>Jane Smith</strong> started following you</p>
                <p class="text-muted-foreground text-xs mt-1 m-0">5 hours ago</p>
              </div>
            </div>
          </div>
          <div class="dropdown-item p-3 cursor-pointer hover:bg-muted/50">
            <div class="d-flex gap-3">
              <div class="avatar-placeholder w-10 h-10 flex-shrink-0"></div>
              <div class="flex-grow-1 min-w-0">
                <p class="text-foreground text-sm m-0">New comment on your post</p>
                <p class="text-muted-foreground text-xs mt-1 m-0">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-2 border-top border-muted text-center">
          <a href="/notifications" class="text-sm text-primary text-decoration-none hover:underline">View all notifications</a>
        </div>
      </div>
    </div>
  `,
})
export class NotificationBellComponent { }
