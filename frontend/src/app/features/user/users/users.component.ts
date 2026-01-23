import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { UserService, User } from "../../../core/services/user.service"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./users.component.html"
})
export class UsersComponent {
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  users: User[] = [];
  currentUserId: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.loadUsers();
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user ? user.id : null;
    }
    );
  }

  loadUsers() {
    this.userService.getUsers(0, 50).subscribe({
      next: (page: any) => {
        this.users = page.content.filter((user: User) => {
          return user.id !== this.currentUserId;
        });
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }
  toggleFollow(user: User) {
    console.log('Toggling follow for user:', user);
    this.userService.toggleFollow(user.id).subscribe({
      next: () => {
        user.followed = !user.followed;
        user.followersCount += user.followed ? 1 : -1;
      },
      error: (err) => {
        console.error('Failed to toggle follow', err);
      }
    });
  }
}
