import type { Routes } from "@angular/router"
import { NonAuthGuard } from '../app/core/guards/auth.guard';
import { LoginComponent } from "../app/features/auth/login/login.component"
import { RegisterComponent } from "../app/features/auth/register/register.component"
import { FeedComponent } from "./features/post/feed/feed.component"
import { ProfileComponent } from "./features/user/profile/profile.component"
import { AdminDashboardComponent } from "./features/admin/admin-dashboard/admin-dashboard.component"

export const routes: Routes = [
  { path: "login", component: LoginComponent ,canActivate: [NonAuthGuard]},
  { path: "register", component: RegisterComponent ,canActivate: [NonAuthGuard]},
  { path: "feed", component: FeedComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "admin", component: AdminDashboardComponent },
]
