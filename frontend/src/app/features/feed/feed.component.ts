// src/app/modules/feed/components/feed/feed.component.ts

import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { PostCardComponent } from "../../shared/components/post-card/post-card.component"
import { CreateEditPostModalComponent } from "../../shared/components/create-post-modal/create-edit-post-modal.component"
import { Post, PostService, type Post as ApiPost, } from "../../core/services/post.service"
import { User, UserService } from "../../core/services/user.service"
import { AuthService } from "../../core/services/auth.service"
import { ToastService } from "../../core/services/toast.service"


@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PostCardComponent, CreateEditPostModalComponent],
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  posts: Post[] = []
  SuggestionsUsers: User[] = []
  searchQuery: string = ''
  categorySelected: 'All' | 'Following' = 'All';
  isLoading = false
  errorMessage: string | null = null
  currentUser: any = null
  constructor(private postService: PostService, private userService: UserService, private authService: AuthService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadFeed()
    this.loadSuggestions()
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userService.getUserById(user.id).subscribe(userData => {
          this.currentUser = userData;
        });
      }
    });
  }

  private loadFeed(): void {
    this.isLoading = true
    this.errorMessage = null
    const feed$ = this.categorySelected == "All" ? this.postService.getFeed() : this.postService.getFollowingUsersPosts()
    feed$.subscribe({
      next: (pageResp: Post[]) => {
        this.posts = pageResp.map((post) => this.mapPost({
          ...post,
          createdAt: new Date(post.createdAt).toLocaleString(),
          updatedAt: new Date(post.updatedAt).toLocaleString(),
        }))
        this.isLoading = false
      },
      error: (err) => {
        console.error("Failed to load feed", err)
        this.toast.showError("Error", "Failed to load feed")
        this.isLoading = false
      },
    })
  }
  selectCategory(category: 'All' | 'Following') {
    if (this.categorySelected !== category) {
      this.categorySelected = category;
      this.loadFeed();
    }
  }
  loadSuggestions(): void {
    this.userService.getUsers().subscribe(
      {
        next: (Sug: User[]) => {
          this.SuggestionsUsers = Sug.filter(u => !u.followed && u.id !== this.currentUser?.id).slice(0, 8)
          console.log(this.SuggestionsUsers)
        },
        error: (err) => {
          console.error("Failed to load Suggestions users", err)
          this.toast.showError("Error", "Failed to load Suggestions users")
          this.isLoading = false
        },
      }
    )
  }

  toggleFollow(user: User) {
    this.userService.toggleFollow(user.id).subscribe({
      next: () => {
        user.followed = !user.followed;
      },
      error: (err) => {
        console.error('Failed to toggle follow', err);
      }
    });
  }




  private mapPost(apiPost: ApiPost): Post {
    return apiPost
  }

  onPostCreated(apiPost: ApiPost): void {
    const mapped = this.mapPost(apiPost)
    this.posts = [mapped, ...this.posts]
    this.currentUser.postsCount += 1;
  }
}