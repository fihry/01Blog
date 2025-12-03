import type { Routes } from "@angular/router"
import { LoginComponent } from "../app/features/auth/login/login.component"
import { RegisterComponent } from "../app/features/auth/register/register.component"
import { FeedComponent } from "./features/post/feed/feed.component"
import { ProfileComponent } from "./features/user/profile/profile.component"
import { AdminDashboardComponent } from "./features/admin/admin-dashboard/admin-dashboard.component"

export const routes: Routes = [
  { path: "", redirectTo: "/feed", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "feed", component: FeedComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "admin", component: AdminDashboardComponent },
]
