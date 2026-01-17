// src/app/modules/feed/components/feed/feed.component.ts

import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { PostCardComponent } from "../../shared/components/post-card/post-card.component"
import { CreateEditPostModalComponent } from "../../shared/components/create-post-modal/create-edit-post-modal.component"
import { Post, PostService, type Post as ApiPost, type PostPage } from "../../core/services/post.service"
import { UserService } from "../../core/services/user.service"
import { AuthService } from "../../core/services/auth.service"


@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PostCardComponent, CreateEditPostModalComponent],
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  posts: Post[] = []
  searchQuery: string = ''

  isLoading = false
  errorMessage: string | null = null
  currentUser: any = null
  constructor(private postService: PostService, private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadFeed()
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userService.getUserById(user.id).subscribe(userData => {
          this.currentUser = userData;
        });
      }
    });
  }

  private loadFeed(page = 0, limit = 10): void {
    this.isLoading = true
    this.errorMessage = null
    this.postService.getFeed(page, limit).subscribe({
      next: (pageResp: PostPage) => {
        this.posts = pageResp.content.map((post) => this.mapPost({
          ...post,
          createdAt: new Date(post.createdAt).toLocaleString(),
          updatedAt: new Date(post.updatedAt).toLocaleString(),
        }))
        this.isLoading = false
      },
      error: (err) => {
        console.error("Failed to load feed", err)
        this.errorMessage = "Unable to load posts. Please try again later."
        this.isLoading = false
      },
    })
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