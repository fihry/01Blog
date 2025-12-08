import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { PostCardComponent } from "../post-card/post-card.component"
import {CreatePostModalComponent} from "../create-post-modal/create-post-modal.component"

interface Post {
  id: number
  title: string
  content: string
  author: string
  likes: number
  comments: number
  timestamp: string
}

@Component({
  selector: "app-feed",
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="min-h-screen bg-slate-950">
      <div class="max-w-2xl mx-auto py-8 px-4">
        <h1 class="text-3xl font-bold text-white mb-8">Your Feed</h1>

        <div class="space-y-4">
          <app-post-card *ngFor="let post of posts" [post]="post"></app-post-card>
        </div>
      </div>
    </div>
  `,
})
export class FeedComponent implements OnInit {
  posts: Post[] = []

  ngOnInit(): void {
    this.posts = [
      {
        id: 1,
        title: "Getting Started with Angular",
        content: "Learn the basics of Angular standalone components...",
        author: "John Doe",
        likes: 42,
        comments: 5,
        timestamp: "2 hours ago",
      },
      {
        id: 2,
        title: "TypeScript Best Practices",
        content: "Tips and tricks for writing better TypeScript code...",
        author: "Jane Smith",
        likes: 58,
        comments: 8,
        timestamp: "4 hours ago",
      },
    ]
  }
}
