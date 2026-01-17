import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { Subscription } from "rxjs"
import { PostService, type Post } from "../../../core/services/post.service"
import { CommentService, type Comment } from "../../../core/services/comment.service"
import { SafeMarkdownService } from "../../../core/services/markdown.service"
import { ToastService } from "../../../core/services/toast.service"
import { ReportService } from "../../../core/services/report.service"
import { ReportModalComponent, type ReportData } from "../report-modal/report-modal.component"
import { CreateEditPostModalComponent } from "../create-post-modal/create-edit-post-modal.component"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-post-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReportModalComponent, CreateEditPostModalComponent],
  templateUrl: "./post-detail.component.html",
  styles: [`
    .prose {
      max-width: 65ch;
    }
    
    .dropdown-menu {
      min-width: 200px;
    }
    
    .dropdown-menu.show {
      display: block;
    }
  `],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  @ViewChild(ReportModalComponent) reportModal?: ReportModalComponent

  post: Post | null = null
  isLoadingPost = false
  isLoadingComments = false
  isSubmittingComment = false
  parsedContent = ""
  comments: Array<Comment> = []
  id = ""
  currentUserId: string | undefined
  commentContent = ""
  showDropdown = false
  showReportModal = false
  showEditModal = false

  private routeSubscription?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private markdown: SafeMarkdownService,
    private toastService: ToastService,
    private reportService: ReportService,
    private authService: AuthService
  ) { }

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
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id
    })
    // Close dropdown when clicking outside
    document.addEventListener('click', this.closeDropdown.bind(this))
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
    document.removeEventListener('click', this.closeDropdown.bind(this))
  }

  get isLoading(): boolean {
    return this.isLoadingPost || this.isLoadingComments
  }

  public fetchPost(id: string): void {
    this.isLoadingPost = true
    this.postService.getPost(id).subscribe({
      next: (post) => {
        post.isOwner = post.author.id == this.currentUserId
        this.post = post
        this.parsedContent = this.markdown.parse(post.content || "", false)
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
    } else if (!this.commentContent.trim()) {
      this.toastService.showWarning("Warning", "Comment content cannot be empty.")
      return
    }

    const content = this.commentContent.trim()

    this.isSubmittingComment = true
    this.commentService.createComment(this.id, { content }).subscribe({
      next: (comment) => {
        this.comments.unshift(comment)

        if (this.post) {
          this.post = { ...this.post, commentCount: this.post.commentCount + 1 }
        }
        this.toastService.showSuccess("Success", "Comment added successfully.")
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

  toggleDropdown(event: Event): void {
    event.stopPropagation()
    this.showDropdown = !this.showDropdown
  }

  closeDropdown(): void {
    this.showDropdown = false
  }

  editPost(event: Event): void {
    event.stopPropagation()
    this.closeDropdown()

    if (!this.post) return

    this.showEditModal = true
  }

  closeEditModal(): void {
    this.showEditModal = false
  }

  handlePostUpdated(updatedPost: Post): void {
    this.post = updatedPost
    this.parsedContent = this.markdown.parse(updatedPost.content || "", false)
    this.showEditModal = false
  }

  deletePost(event: Event): void {
    event.stopPropagation()
    this.closeDropdown()

    if (!this.post) return

    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.toastService.showSuccess("Success", "Post deleted successfully.")
          this.router.navigate(['/feed'])
        },
        error: (err) => {
          console.error("Failed to delete post", err)
          this.toastService.showError("Error", err?.error?.message || "Failed to delete post.")
        },
      })
    }
  }

  reportPost(event: Event): void {
    event.stopPropagation()
    this.closeDropdown()

    if (!this.post) return

    this.showReportModal = true
  }

  closeReportModal(): void {
    this.showReportModal = false
  }

  handleReportSubmit(reportData: ReportData): void {
    this.reportService.createReport(reportData).subscribe({
      next: () => {
        this.toastService.showSuccess("Success", "Report submitted successfully. Our team will review it.")
        this.reportModal?.completeSubmission()
      },
      error: (err) => {
        console.error("Failed to submit report", err)
        this.toastService.showError("Error", err?.error?.message || "Failed to submit report.")
        this.reportModal?.completeSubmission()
      },
    })
  }
}