// src/app/modules/feed/components/feed/feed.component.ts

import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { PostCardComponent } from "../post-card/post-card.component"
import { CreatePostModalComponent } from "../create-post-modal/create-post-modal.component"

interface Post {
  id: number
  title: string
  content: string
  author: string
  likes: number
  comments: number
  timestamp: string
  isOwner: boolean
}

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  posts: Post[] = []
  isModalOpen: boolean = false
  ngOnInit(): void {
    this.posts = [
      {
        id: 1,
        title: "Getting Started with Angular",
        content: "Learn the basics of Angular standalone components and reactive programming. It's time to build scalable applications!",
        author: "John Doe",
        likes: 42,
        comments: 5,
        timestamp: "2 hours ago",
        isOwner: true
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        content: "Tips and tricks for writing better TypeScript code, focusing on utility types and generics for maximum type safety and flexibility.",
        author: "Jane Smith",
        likes: 58,
        comments: 8,
        timestamp: "4 hours ago",
        isOwner: true

      },
      {
        id: 3,
        title: "Designing for Dark Mode: A Comprehensive Guide",
        content: "We dive into the psychology of dark UI and how to choose colors that look great and reduce eye strain, especially in social apps.",
        author: "Alice Johnson",
        likes: 120,
        comments: 15,
        timestamp: "1 day ago",
        isOwner: false,
      },
    ]
  }

  // Methods to control the modal
  openCreatePostModal(): void {
    this.isModalOpen = true
  }

  closeCreatePostModal(): void {
    this.isModalOpen = false
  }
}