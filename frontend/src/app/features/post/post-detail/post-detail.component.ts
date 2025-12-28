import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { Subscription } from "rxjs"
import { PostService, type Post } from "../../../core/services/post.service"
import { CommentService, type Comment } from "../../../core/services/comment.service"
import { SafeMarkdownService } from "../../../shared/services/markdown.service"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-post-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./post-detail.component.html",
  styles: [`
    .prose {
      max-width: 65ch;
    }
  `],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: Post | null = null
  isLoadingPost = false
  isLoadingComments = false
  isSubmittingComment = false
  parsedContent = ""
  comments: Array<Comment> = []
  id = ""
  commentContent = ""
  
  private routeSubscription?: Subscription

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    private markdown: SafeMarkdownService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      
      if (!id) {
        this.post = null
        this.id = ""
        this.comments = []
        return
      }
      
      this.id = id
      this.fetchPost(id)
      this.fetchComments(id)
    })
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
  }

  get isLoading(): boolean {
    return this.isLoadingPost || this.isLoadingComments
  }

  public fetchPost(id: string): void {
    this.isLoadingPost = true
    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.post = post
        this.parsedContent = this.markdown.parse(post.content || "")
        this.isLoadingPost = false
      },
      error: (err) => {
        console.error("Failed to load post", err)
        this.post = null
        this.parsedContent = ""
        this.isLoadingPost = false
      },
    })
  }

  private fetchComments(id: string): void {
    this.isLoadingComments = true
    this.commentService.getComments(id).subscribe({
      next: (comments) => {
        this.comments = comments
        
        // Update post comment count if post is already loaded
        if (this.post) {
          this.post = { ...this.post, commentCount: comments.length }
        }
        
        console.log("Comments loaded:", comments)
        this.isLoadingComments = false
      },
      error: (err) => {
        console.error("Failed to load comments", err)
        this.isLoadingComments = false
      },
    })
  }

  createComment(): void {
    if (!this.id) {
      console.error("Post ID is missing. Cannot create comment.")
      this.toastService.showError("Error", "Post ID is missing. Cannot create comment.")
      return
    }else if (!this.commentContent.trim()) {
      this.toastService.showWarning("Warning", "Comment content cannot be empty.")
      return
    }

    const content = this.commentContent.trim()
    
    this.isSubmittingComment = true
    this.commentService.createComment(this.id, { content }).subscribe({
      next: (comment) => {
        // Add comment to list in the beginning
        this.comments.unshift(comment)
        
        // Update post comment count
        if (this.post) {
          this.post = { ...this.post, commentCount: this.post.commentCount + 1 }
        }
        this.toastService.showSuccess("Success", "Comment added successfully.")
        // Clear input
        this.commentContent = ""
        this.isSubmittingComment = false
      },
      error: (err) => {
        console.error("Failed to create comment", err)
        this.toastService.showError("Error", err?.error?.message || "Failed to create comment.")
        this.isSubmittingComment = false
      },
    })
  }

  // Uncomment and fix these methods if needed
  // deleteComment(commentId: string): void {
  //   if (!this.id) return
  //   
  //   this.isLoadingComments = true
  //   this.commentService.deleteComment(this.id, commentId).subscribe({
  //     next: () => {
  //       this.comments = this.comments.filter(c => c.id !== commentId)
  //       
  //       if (this.post) {
  //         this.post = { ...this.post, commentCount: Math.max(0, this.post.commentCount - 1) }
  //       }
  //       
  //       this.isLoadingComments = false
  //     },
  //     error: (err) => {
  //       console.error("Failed to delete comment", err)
  //       this.isLoadingComments = false
  //     },
  //   })
  // }

  // updateComment(commentId: string, content: string): void {
  //   if (!this.id) return
  //   
  //   this.isLoadingComments = true
  //   this.commentService.updateComment(this.id, commentId, { content }).subscribe({
  //     next: (updatedComment) => {
  //       this.comments = this.comments.map(c => 
  //         c.id === commentId ? updatedComment : c
  //       )
  //       this.isLoadingComments = false
  //     },
  //     error: (err) => {
  //       console.error("Failed to update comment", err)
  //       this.isLoadingComments = false
  //     },
  //   })
  // }
}