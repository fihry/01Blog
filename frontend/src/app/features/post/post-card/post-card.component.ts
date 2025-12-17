// src/app/modules/feed/components/post-card/post-card.component.ts

import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

interface Post {
  id: string
  title: string
  content: string
  author: string
  likes: number
  comments: number
  timestamp: string
  isOwner: boolean
}

@Component({
  selector: "app-post-card",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./post-card.component.html",
  styleUrls: ["./post-card.component.scss"],
})
export class PostCardComponent {
  @Input() post!: Post
  // 💡 OUTPUT: Event to notify the parent component (FeedComponent) when to delete the post
  @Output() deletePost = new EventEmitter<string>();

  // --- Interaction Methods ---

  onLike() {
    // Placeholder for future API call to like/unlike the post
    console.log(`Liking post ${this.post.id}`);
  }

  onComment() {
    // Placeholder for future routing or modal logic for comments
    console.log(`Opening comments for post ${this.post.id}`);
  }

  onDelete() {
    // Confirm deletion for better UX
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.deletePost.emit(this.post.id);
    }
  }
}