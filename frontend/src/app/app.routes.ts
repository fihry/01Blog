import type { Routes } from "@angular/router"
import { NonAuthGuard } from '../app/core/guards/auth.guard';
import { LoginComponent } from "../app/features/auth/login/login.component"
import { RegisterComponent } from "../app/features/auth/register/register.component"
import { FeedComponent } from "./features/post/feed/feed.component"
import { ProfileComponent } from "./features/user/profile/profile.component"
import { AdminDashboardComponent } from "./features/admin/admin-dashboard/admin-dashboard.component"
import { PostDetailComponent } from "./features/post/post-detail/post-detail.component"
import { SettingsComponent } from "./features/user/settings/settings.component"
import { NotificationListComponent } from "./features/notification/notification-list/notification-list.component"
import { UsersComponent } from "./features/user/users/users.component"
import { NotFoundComponent } from "./shared/components/not-found/not-found.component"

export const routes: Routes = [
  { path: "", redirectTo: "/feed", pathMatch: "full" },
  { path: "login", component: LoginComponent, canActivate: [NonAuthGuard] },
  { path: "register", component: RegisterComponent, canActivate: [NonAuthGuard] },
  { path: "feed", component: FeedComponent },
  { path: "users", component: UsersComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "post/:id", component: PostDetailComponent },
  { path: "notifications", component: NotificationListComponent },
  { path: "settings", component: SettingsComponent },
  { path: "admin", component: AdminDashboardComponent },
  { path: "**", component: NotFoundComponent }
]
