import { Component, type OnInit, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule, Router } from "@angular/router"
import { UserService } from "../../../core/services/user.service"
import { AuthService } from "../../../core/services/auth.service"
import { PostCardComponent } from "../../../shared/components/post-card/post-card.component"
import { Post, PostService, PostPage } from "../../../core/services/post.service"
import { ToastService } from "../../../core/services/toast.service"
import { ReportService } from "../../../core/services/report.service"
import { ReportModalComponent, type ReportData } from "../../../shared/components/report-modal/report-modal.component"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, ReportModalComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  @ViewChild(ReportModalComponent) reportModal?: ReportModalComponent
  user: any = null
  posts: Post[] = []
  currentUserId: string | null = null
  isFollowing: boolean = false
  loading: boolean = true
  showReportModal = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private postService: PostService,
    private toastService: ToastService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user ? user.id : null
    })
    this.route.params.subscribe((params: any) => {
      const userId = params["id"]
      if (userId) {
        this.loadProfile(userId)
        this.loadPosts(userId)
      }
    })
  }

  loadProfile(userId: string) {
    this.loading = true
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user
        this.isFollowing = user.followed || false
        this.loading = false
      },
      error: (err) => {
        console.error("Failed to load profile", err)
        this.loading = false
        if (err.status === 404 || err.status === 400) {
          this.router.navigate(['/404'])
        } else {
          this.toastService.showError('Error', 'Failed to load profile')
        }
      }
    })
  }
  loadPosts(userId: string) {
    this.userService.getUserPosts(userId).subscribe({
      next: (pageResp: PostPage) => {
        this.posts = pageResp.content.map((post) => ({
          ...post,
          createdAt: new Date(post.createdAt).toLocaleString(),
          updatedAt: new Date(post.updatedAt).toLocaleString(),
        }))
      },
      error: (err) => console.error("Failed to load posts", err)
    })
  }
  private mapPost(apiPost: Post): Post {
    return apiPost
  }

  toggleFollow() {
    if (!this.user) return
    this.userService.toggleFollow(this.user.id).subscribe({
      next: () => {
        // Toggle the following state
        this.isFollowing = !this.isFollowing
        // Update followers count
        if (this.isFollowing) {
          this.user.followersCount++
        } else {
          this.user.followersCount--
        }
      },
      error: (err) => {
        console.error("Failed to toggle follow", err)
        this.toastService.showError('Error', 'Failed to toggle follow')
      }
    })
  }

  isOwnProfile(): boolean {
    return this.currentUserId === this.user?.id
  }

  onDeletePost(postId: string) {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId)
        if (this.user) {
          this.user.postsCount--
        }
      },
      error: (err) => console.error("Failed to delete post", err)
    })
  }

  openReportModal() {
    this.showReportModal = true
  }

  closeReportModal() {
    this.showReportModal = false
  }

  handleReportSubmit(reportData: ReportData) {
    this.reportService.createReport(reportData).subscribe({
      next: () => {
        this.toastService.showSuccess("Success", "User reported successfully. Our team will review it.")
        this.reportModal?.completeSubmission()
      },
      error: (err) => {
        console.error("Failed to submit report", err)
        this.toastService.showError("Error", err?.error?.message || "Failed to submit report.")
        this.reportModal?.completeSubmission()
      }
    })
  }
}