import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule, Router } from "@angular/router"
import { UserService } from "../../../core/services/user.service"
import { AuthService } from "../../../core/services/auth.service"
import { PostCardComponent } from "../../post/post-card/post-card.component"
import { PostService } from "../../../core/services/post.service"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = null
  posts: any[] = []
  currentUserId: string | null = null
  isFollowing: boolean = false
  loading: boolean = true

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private postService: PostService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user ? user.id : null
    })
    this.route.params.subscribe((params: any) => {
      const userId = params["id"]
      if (userId) {
        this.loadProfile(userId)
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
        this.loadPosts(userId)
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
      next: (posts) => {
        this.posts = posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: this.user.username, // Profile page posts are always by the profile owner
          likes: post.like_count,
          comments: post.comment_count,
          timestamp: new Date(post.created_at).toLocaleDateString(), // Format as needed
          isOwner: this.currentUserId === post.author?.id || this.currentUserId === userId,
          likedByCurrentUser: post.liked_by_user
        }))
      },
      error: (err) => console.error("Failed to load posts", err)
    })
  }

  toggleFollow() {
    if (!this.user) return
    this.userService.followUser(this.user.id).subscribe({
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
}