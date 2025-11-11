# Backend Modules

## Authentication
- AuthController
- JwtService
- UserDetailsServiceImpl

## User
- UserService
- UserRepository (extends JpaRepository<User, Long>)
- Profile management, subscriptions

## Post
- PostService
- PostRepository (extends JpaRepository<Post, Long>)
- MinioService: uploadFile(), getPresignedUrl()
- Handles CRUD, likes, comments, media

## Notification
- NotificationService
- Generate notifications on new posts/comments

## Report
- ReportService
- Store and manage reports

## Admin
- AdminService
- Moderation tools, analytics

## Chat (future)
- ChatService
- MessageRepository (extends JpaRepository<Message, Long>)
- Supports text/audio/video

# Frontend Modules

## AuthModule
- LoginPage, RegisterPage

## UserModule
- ProfilePage, EditProfilePage, SubscriptionsPage

## PostModule
- FeedPage, PostDetailPage, CreatePostModal
- PostCardComponent, CommentSectionComponent
- PostService handles HTTP & file upload to backend/MinIO

## NotificationModule
- NotificationBellComponent, NotificationListComponent

## ReportModule
- ReportModalComponent

## AdminModule
- AdminDashboardPage, UserManagementPage, PostManagementPage

## SharedModule
- NavbarComponent, SidebarComponent, SpinnerComponent, ToastComponent
