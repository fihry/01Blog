import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { PostService, type Post } from "../../../core/services/post.service"
import { SafeMarkdownService } from "../../../shared/services/markdown.service"
import { CommentService, Comment } from "../../../core/services/comment.service"


@Component({
  selector: "app-post-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl:"./post-detail.component.html",
  styles: [`
    .prose {
      max-width: 65ch;
    }
  `],
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null
  isLoading = false
  parsedContent=""
  superman : Comment[] = []

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private markdown: SafeMarkdownService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (!id) {
        this.post = null
        return
      }
      this.fetchPost(id)
      this.fetchComments(id)
    })
  }

  private fetchPost(id: string): void {
    this.isLoading = true
    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.post = post
        this.isLoading = false
        this.parsedContent = this.markdown.parse(this.post?.content)
      },
      error: (err) => {
        console.error("Failed to load post", err)
        this.post = null
        this.isLoading = false
        this.parsedContent = ""
      },
    })
  }

  private fetchComments(id: string): void {
    this.commentService.getComments(id).subscribe({
      next: (cmmnts) => {
        this.superman = cmmnts
      },
      error: (err) => {
        console.error(err)
      }
    })
  }
}