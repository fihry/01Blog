// src/app/modules/feed/components/feed/feed.component.ts

import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { PostCardComponent } from "../post-card/post-card.component"
import { CreatePostModalComponent } from "../create-post-modal/create-post-modal.component"
import { PostService, type Post as ApiPost, type PostPage } from "../../../core/services/post.service"
import { ToastService } from "../../../shared/services/toast.service"

interface Post {
  id: string
  title: string
  content: string
  author: string
  likes: number
  comments: number
  timestamp: string
  isOwner: boolean
  likedByCurrentUser: boolean
}

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PostCardComponent, CreatePostModalComponent],
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  posts: Post[] = []
  searchQuery: string = ''

  isLoading = false
  errorMessage: string | null = null

  constructor(private postService: PostService ,private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadFeed()
  }

  private loadFeed(page = 0, limit = 10): void {
    this.isLoading = true
    this.errorMessage = null
    this.postService.getFeed(page, limit).subscribe({
      next: (pageResp: PostPage) => {
        this.posts = pageResp.content.map((post) => this.mapPost(post))
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
    return {
      id: apiPost.id,
      title: apiPost.title,
      content: apiPost.content,
      author: apiPost.author?.username ?? "Unknown",
      likes: apiPost.likeCount ?? 0,
      comments: apiPost.commentCount ?? 0,
      // TODO: Replace with proper relative time formatting
      timestamp: new Date(apiPost.createdAt).toLocaleString(),
      // TODO: Use AuthService to determine if current user is owner
      isOwner: false,
      likedByCurrentUser: apiPost.likedByCurrentUser ?? false,
    }
  }

  onPostCreated(apiPost: ApiPost): void {
    const mapped = this.mapPost(apiPost)
    this.posts = [mapped, ...this.posts]
  }
}