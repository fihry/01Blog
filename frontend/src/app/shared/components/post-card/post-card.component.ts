// src/app/modules/feed/components/post-card/post-card.component.ts

import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule } from "@angular/router"
import { PostService, Post } from "../../../core/services/post.service"
import { MarkdownService } from "../../../core/services/markdown.service"
import { ToastService } from "../../../core/services/toast.service"




// interface Post {
//   id: string
//   title: string
//   content: string
//   author: string
//   likes: number
//   comments: number
//   timestamp: string
//   isOwner: boolean
//   likedByCurrentUser: boolean
// }

@Component({
  selector: "app-post-card",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./post-card.component.html",
  styleUrls: ["./post-card.component.scss"],
})
export class PostCardComponent {
  @Input() post!: Post;
  //OUTPUT: Event to notify the parent component (FeedComponent) when to delete the post
  @Output() deletePost = new EventEmitter<string>();

  isLiking = false
  parsedContent = ""
  constructor(
    private postService: PostService,
    private router: Router,
    private markdown: MarkdownService,
    private toastService: ToastService,
  ) { }

  // --- Interaction Methods ---
  ngOnInit() {
    this.parsedContent = this.markdown.parse(this.post.content, true, this.post.media)
  }
  onLike() {
    if (this.isLiking) return
    this.isLiking = true

    this.postService.likePost(this.post.id).subscribe({
      next: () => {
        // Optimistic toggle
        if (this.post.likedByCurrentUser) {
          this.post.likedByCurrentUser = false
          this.post.likeCount = Math.max(0, this.post.likeCount - 1)
        } else {
          this.post.likedByCurrentUser = true
          this.post.likeCount = this.post.likeCount + 1
        }
        this.isLiking = false
      },
      error: (err) => {
        console.error("Failed to like post", err)
        this.toastService.showError("Error", "Failed to like post")
        this.isLiking = false
      },
    })
  }

  onComment() {
    this.router.navigate(["/post", this.post.id])
  }

  onDelete() {
    // Confirm deletion for better UX
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.deletePost.emit(this.post.id);
    }
  }
}