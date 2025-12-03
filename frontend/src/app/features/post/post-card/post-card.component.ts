import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

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
  selector: "app-post-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 rounded-lg shadow-md p-6 border border-slate-800 hover:border-cyan-600 transition">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-white">{{ post.title }}</h3>
          <p class="text-slate-400 text-sm">by {{ post.author }} · {{ post.timestamp }}</p>
        </div>
      </div>

      <p class="text-slate-300 mb-4">{{ post.content }}</p>

      <div class="flex gap-6 text-slate-400">
        <button class="hover:text-cyan-400 transition flex items-center gap-2">
          <span>👍</span> {{ post.likes }}
        </button>
        <button class="hover:text-cyan-400 transition flex items-center gap-2">
          <span>💬</span> {{ post.comments }}
        </button>
      </div>
    </div>
  `,
})
export class PostCardComponent {
  @Input() post!: Post
}
