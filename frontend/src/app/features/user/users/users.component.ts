import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { UserService, User } from "../../../core/services/user.service"

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-m mx-auto p-4">
        
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-5">
          <h1 class="text-3xl font-bold text-foreground m-0">Community Members</h1>
          <div class="segmented-control">
            <button class="segment" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
            <button class="segment" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="app-widget-card p-3 mb-4">
          <div class="input-group">
            <span class="input-group-text bg-transparent border-0">
              <i class="bi bi-search text-muted-foreground"></i>
            </span>
            <input 
              type="text" 
              class="form-control border-0 shadow-none" 
              placeholder="Search users..."
              [(ngModel)]="searchQuery"
            >
          </div>
        </div>

        <!-- Grid View -->
        <div *ngIf="viewMode === 'grid'" class="row g-4">
          <div *ngFor="let user of users" class="col-md-6 col-lg-4">
            <div class="app-widget-card p-4 text-center hover:shadow-lg transition">
              <div class="avatar-large-placeholder w-20 h-20 mx-auto mb-3">
                  <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" class="w-full h-full object-cover rounded-full">
              </div>
              <h3 class="text-lg font-bold text-foreground mb-1">{{ user.username }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ user.email }}</p>
              <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ user.bio }}</p>
              
              <div class="d-flex justify-content-center gap-4 mb-3 text-sm">
                <div>
                  <span class="font-bold text-foreground">{{ user.postsCount }}</span>
                  <span class="text-muted-foreground ms-1">Posts</span>
                </div>
                <div>
                  <span class="font-bold text-foreground">{{ user.followersCount }}</span>
                  <span class="text-muted-foreground ms-1">Followers</span>
                </div>
              </div>
              
              <div class="d-flex gap-2">
                <a [routerLink]="['/profile', user.id]" class="btn btn-outline-secondary flex-grow-1">View</a>
                <button class="btn btn-primary flex-grow-1">Follow</button>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div *ngIf="viewMode === 'list'" class="d-flex flex-column gap-3">
          <div *ngFor="let user of users" class="app-widget-card p-4 hover:bg-muted/50 transition">
            <div class="d-flex gap-4 align-items-center">
              <div class="avatar-placeholder w-12 h-12 flex-shrink-0">
                 <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" class="w-full h-full object-cover rounded-full">
              </div>
              <div class="flex-grow-1 min-w-0">
                <h3 class="text-lg font-bold text-foreground mb-1">{{ user.username }}</h3>
                <p class="text-sm text-muted-foreground mb-2">{{ user.email }}</p>
                <p class="text-sm text-muted-foreground mb-2 line-clamp-2">{{ user.bio }}</p>
                <div class="d-flex gap-4 text-sm">
                  <span><span class="font-semibold">{{ user.postsCount }}</span> posts</span>
                  <span><span class="font-semibold">{{ user.followersCount }}</span> followers</span>
                </div>
              </div>
              <div class="d-flex gap-2 flex-shrink-0">
                <a [routerLink]="['/profile', user.id]" class="btn btn-outline-secondary">View Profile</a>
                <button class="btn btn-primary">Follow</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class UsersComponent {
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  users: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(0, 50).subscribe({
      next: (page: any) => {
        this.users = page.content;
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }
}
